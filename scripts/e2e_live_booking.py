"""End-to-end live test of the AIBus backend against the Mantis GDS API.

Books one real seat on the demo bus and cancels it again.
Usage: python scripts/e2e_live_booking.py [backend_base] [journey_date] [bus_id]
"""
import json
from datetime import date, timedelta
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
DATE = sys.argv[2] if len(sys.argv) > 2 else (date.today() + timedelta(days=2)).isoformat()
BUS_ID = int(sys.argv[3]) if len(sys.argv) > 3 else 1
SRC, DST = "Bengaluru", "Chennai"

results = []


def call(method, path, body=None, timeout=120):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(raw)
        except ValueError:
            return e.code, {"raw": raw[:300]}


def check(name, ok, detail=""):
    results.append((name, bool(ok)))
    print(("PASS  " if ok else "FAIL  ") + name + (("  -> " + str(detail)) if detail != "" else ""))
    return ok


def balance():
    status, body = call("GET", "/api/gds/balance")
    return (body.get("data") or {}).get("Balance") if status == 200 else None


q = urllib.parse.urlencode({"source": SRC, "destination": DST, "date": DATE})

# 1. Agent balance before
bal_before = balance()
check("1. agent balance readable", bal_before is not None, bal_before)

# 2. Search
status, body = call("GET", "/api/buses/search?" + q)
live = [b for b in (body.get("data") or []) if b.get("provider") == "GDS"]
check("2. search returns live buses", status == 200 and len(live) > 0,
      [(b["gdsBusId"], b["busName"], b["busType"], b["fare"]) for b in live])

# 3. Bus details + seat chart
status, body = call("GET", f"/api/gds/buses/{BUS_ID}?" + q)
bus = body.get("data") or {}
seats = [s for d in bus.get("decks", []) for s in d["seats"]]
free = [s for s in seats if s["status"] == "AVAILABLE" and not s.get("reservedFor")]
check("3. seat chart loads", status == 200 and len(seats) > 0,
      f"{len(seats)} seats, {len(free)} free, fare {bus.get('fare')}")
if not free:
    sys.exit("no free seat to test with")

seat = free[-1]
pickup = bus["boardingPoints"][0]
dropoff = bus["droppingPoints"][0]
print(f"      using seat {seat['seatNumber']} (Rs {seat['fare']}), pickup {pickup['name']}, dropoff {dropoff['name']}")

# 4. Hold
status, body = call("POST", "/api/gds/bookings/hold", {
    "source": SRC, "destination": DST, "journeyDate": DATE, "busId": BUS_ID,
    "pickupId": pickup["id"], "dropoffId": dropoff["id"],
    "contactMobile": "9876543210", "contactEmail": "e2e-test@example.com",
    "passengers": [{"name": "Test Passenger", "age": 30, "gender": "Male",
                    "seatNumber": seat["seatNumber"], "mobile": "9876543210"}],
})
held = body.get("data") or {}
ref = held.get("bookingReference")
check("4. hold seats", status == 200 and held.get("bookingStatus") == "PENDING" and ref,
      f"{ref}, total {held.get('totalAmount')}" if ref else body)
if not ref:
    sys.exit("hold failed")

# 5. Seat now shown as booked in the chart
status, body = call("GET", f"/api/gds/buses/{BUS_ID}?" + q)
now = {s["seatNumber"]: s["status"] for d in (body.get("data") or {}).get("decks", []) for s in d["seats"]}
check("5. held seat no longer available in chart", now.get(seat["seatNumber"]) == "BOOKED", now.get(seat["seatNumber"]))

# 6. Book (real ticket)
status, body = call("POST", f"/api/gds/bookings/{ref}/confirm", timeout=150)
booked = body.get("data") or {}
pnr, ticket = booked.get("pnrNo"), booked.get("ticketNo")
check("6. book seats (BookSeats)", status == 200 and booked.get("bookingStatus") == "CONFIRMED" and pnr and ticket,
      f"PNR {pnr}, ticket {ticket}, total {booked.get('totalAmount')}" if pnr else body)
if not pnr:
    sys.exit("booking failed, reference " + ref)

# 7. Confirm is idempotent (no second booking)
status, body = call("POST", f"/api/gds/bookings/{ref}/confirm")
again = body.get("data") or {}
check("7. confirming again returns the same ticket", status == 200 and again.get("pnrNo") == pnr and again.get("ticketNo") == ticket)

# 8. Our booking details endpoint
status, body = call("GET", f"/api/bookings/{ref}")
d = body.get("data") or {}
check("8. booking details from /api/bookings", status == 200 and d.get("provider") == "GDS" and d.get("pnrNo") == pnr
      and d.get("selectedSeats") == [seat["seatNumber"]],
      f"{d.get('bookingStatus')}, {d.get('boardingPoint')} {d.get('boardingTime')} -> {d.get('droppingPoint')}")

# 9. Provider's own ticket details
status, body = call("GET", "/api/gds/booking-details?" + urllib.parse.urlencode({"pnr": pnr, "ticketNo": ticket}))
t = body.get("data") or {}
check("9. provider ticket details (BookingDetails)", status == 200 and str(t.get("PNRNo")) == str(pnr),
      {k: t.get(k) for k in ("CompanyName", "FromCityName", "ToCityName", "TotalFare", "TotalSeats", "IsCancelled")})

# 10. Balance went down by the fare
bal_booked = balance()
check("10. agent balance reduced after booking", bal_before is not None and bal_booked is not None and bal_booked < bal_before,
      f"{bal_before} -> {bal_booked}")

# 11. Cancellation quote
status, body = call("GET", f"/api/gds/bookings/{ref}/cancellation")
quote = body.get("data") or {}
check("11. cancellation quote (IsCancellable)", status == 200 and quote.get("cancellable") is True,
      f"fare {quote.get('totalFare')}, charge {quote.get('chargePercent')}%, refund {quote.get('refundAmount')}")

# 12. Cancel
status, body = call("POST", f"/api/bookings/{ref}/cancel", timeout=150)
c = body.get("data") or {}
check("12. cancel ticket (CancelSeats)", status == 200 and c.get("status") == "CANCELLED",
      f"refund {c.get('refundAmount')}, charge {c.get('cancellationCharge')}" if status == 200 else body)

# 13. Booking shows as cancelled with refund
status, body = call("GET", f"/api/bookings/{ref}")
d = body.get("data") or {}
check("13. booking is CANCELLED with refund stored", d.get("bookingStatus") == "CANCELLED" and d.get("refundAmount") is not None,
      f"refund {d.get('refundAmount')}, charge {d.get('cancellationCharge')}")

# 14. Cancelling twice is rejected
status, body = call("POST", f"/api/bookings/{ref}/cancel")
check("14. second cancel is rejected", status == 400, body.get("message"))

# 15. Seat is free again
status, body = call("GET", f"/api/gds/buses/{BUS_ID}?" + q)
now = {s["seatNumber"]: s["status"] for d in (body.get("data") or {}).get("decks", []) for s in d["seats"]}
check("15. seat is available again after cancel", now.get(seat["seatNumber"]) == "AVAILABLE", now.get(seat["seatNumber"]))

# 16. Balance after refund
bal_after = balance()
check("16. agent balance after refund", bal_after is not None and bal_after >= bal_booked, f"{bal_booked} -> {bal_after}")

failed = [n for n, ok in results if not ok]
print(f"\n{len(results) - len(failed)}/{len(results)} passed; reference {ref}, PNR {pnr}, ticket {ticket}")
print(f"balance: before {bal_before}, after booking {bal_booked}, after cancel {bal_after}")
sys.exit(1 if failed else 0)
