import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import busService from "../../services/busService";
import bookingService from "../../services/bookingService";
import authService from "../../services/authService";
import "./BookingConfirmation.css";

function formatTripDate(dateStr) {
  if (!dateStr) return "Tue, 17 Sep 2026";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function getArrivalDateStr(departureDateStr, departureTime = "23:45", arrivalTime = "08:15") {
  if (!departureDateStr) return "Wed, 18 Sep 2026";
  try {
    const parts = departureDateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      
      const depHour = parseInt(departureTime.split(":")[0], 10) || 0;
      const arrHour = parseInt(arrivalTime.split(":")[0], 10) || 0;

      // Next day arrival if arrival hour is less than departure hour
      if (arrHour < depHour) {
        d.setDate(d.getDate() + 1);
      }

      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return departureDateStr;
  } catch {
    return departureDateStr;
  }
}

function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const busId = searchParams.get("busId");
  const seatsParam = searchParams.get("seats");
  const travellersDataParam = searchParams.get("travellersData");
  const contactMobile = searchParams.get("contactMobile") || searchParams.get("mobile") || "9876543210";
  const name = searchParams.get("name");
  const age = searchParams.get("age");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const loggedInUser = authService.getLoggedInUser();

  // Guest Booking Supported: No mandatory login redirect here!
  // If user is not logged in, they can book as guest and ticket is stored in browser.

  // Fetch bus details from backend
  useEffect(() => {
    let isMounted = true;
    busService
      .getBusById(busId, { from, to, date })
      .then((bus) => {
        if (isMounted) {
          setSelectedBus(bus);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load bus details for booking:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [busId, from, to, date]);

  const selectedSeats = seatsParam ? seatsParam.split(",").map((s) => s.trim()) : ["3D", "4D"];

  // Parse multi-passenger list
  let travellers = [];
  try {
    if (travellersDataParam) {
      travellers = JSON.parse(travellersDataParam);
    }
  } catch {
    travellers = [];
  }

  if (travellers.length === 0 && selectedSeats.length > 0) {
    travellers = selectedSeats.map((seat, index) => ({
      seat,
      name: index === 0 ? name || loggedInUser?.name || "Passenger 1" : `Passenger ${index + 1}`,
      age: index === 0 ? age || "25" : "28",
      gender: "Male",
      mobile: contactMobile,
    }));
  }

  // ⏱️ Seat Lock Timer
  const [timeLeft, setTimeLeft] = useState(193); // ~03:13 mins

  useEffect(() => {
    const timer = setInterval(() => {
      const lock = bookingService.getSeatLock();
      if (!lock) {
        // Fallback timer tick if lock is not present
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }

      const secondsRemaining = Math.max(
        0,
        Math.floor((lock.expiresAt - Date.now()) / 1000)
      );
      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) {
        clearInterval(timer);
        bookingService.clearSeatLock();
        alert("Your seat lock timer expired. Please select seats again.");
        navigate(`/seat-selection?busId=${busId || "1"}&from=${from || ""}&to=${to || ""}&date=${date || ""}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [busId, from, to, date, navigate]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="booking-confirmation-page">
        <div className="booking-confirmation-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "1.2rem", color: "#666" }}>
            ⏳ Loading booking details...
          </div>
        </div>
      </main>
    );
  }

  if (!selectedBus) {
    return (
      <main className="booking-confirmation-page">
        <div className="booking-confirmation-container">
          <button
            type="button"
            className="subtle-back-link"
            onClick={() => navigate(-1)}
          >
            ← Edit Details
          </button>
          <div className="not-found-card">
            <h1>Booking Details Not Found</h1>
            <p>Please select a valid bus route from search results.</p>
            <button type="button" className="primary-confirm-btn" onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayFrom = from || selectedBus.from || "Bengaluru";
  const displayTo = to || selectedBus.to || "Pune";
  const displayDate = formatTripDate(date || selectedBus.date);
  const arrivalDateStr = getArrivalDateStr(date || selectedBus.date, selectedBus.departureTime, selectedBus.arrivalTime);
  const totalAmount = selectedSeats.length * selectedBus.price;

  const handleConfirmBooking = async () => {
    const userMobile = loggedInUser?.mobile || contactMobile;

    try {
      setSubmitting(true);
      setBookingError("");

      const isGuest = !loggedInUser;
      const newBooking = await bookingService.createBooking({
        bus: selectedBus,
        travellers,
        seats: selectedSeats,
        totalAmount,
        userMobile,
        userId: loggedInUser?.id || null,
        isGuest,
      });

      navigate(`/booking-success?bookingId=${newBooking.bookingId}&isGuest=${isGuest}`);
    } catch (err) {
      console.error("Booking creation failed:", err);
      setBookingError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="booking-confirmation-page">
      <div className="booking-confirmation-container">
        {/* Top Bar: Subtle Back Link on Left + Centered Lock Timer Strip */}
        <div className="top-nav-timer-bar">
          <button
            type="button"
            className="subtle-back-link"
            onClick={() => navigate(-1)}
          >
            ← Edit Details
          </button>

          {/* Centered Seat Lock Timer Strip */}
          <div className="seat-lock-strip">
            <span className="lock-clock-icon">⏱️</span>
            <span>Seats locked for </span>
            <strong className="timer-val">{formatTimer(timeLeft)}</strong>
            <span> mins</span>
          </div>

          <div className="top-bar-spacer" />
        </div>

        {/* Centered Page Heading */}
        <div className="confirmation-header">
          <h1 className="page-title">Review & Confirm Booking</h1>
          <p className="page-subtext">Please review your bus and passenger details before confirming.</p>
        </div>

        {/* Booking Error Banner */}
        {bookingError && (
          <div style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontWeight: "500",
            textAlign: "center"
          }}>
            ⚠️ {bookingError}
          </div>
        )}

        {/* Single Main White Review Card (max-width ~920px) */}
        <div className="main-review-card">
          {/* Section 1: Bus Details (Text Only) */}
          <div className="review-section">
            <h2 className="section-title">Bus Details</h2>
            <div className="grid-info-rows">
              <div className="info-row">
                <span className="info-label">Operator</span>
                <strong className="info-value">{selectedBus.operator}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Bus Type</span>
                <strong className="info-value">{selectedBus.busType}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Route</span>
                <strong className="info-value">{displayFrom} → {displayTo}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Departure</span>
                <strong className="info-value">
                  {selectedBus.departureTime} <span className="meta-date-inline">({displayDate})</span>
                </strong>
              </div>
              <div className="info-row">
                <span className="info-label">Arrival</span>
                <strong className="info-value">
                  {selectedBus.arrivalTime} <span className="meta-date-inline">({arrivalDateStr})</span>
                </strong>
              </div>
              <div className="info-row">
                <span className="info-label">Duration</span>
                <strong className="info-value">{selectedBus.duration}</strong>
              </div>
            </div>
          </div>

          <div className="section-divider" />

          {/* Section 2: Passenger Details (Dynamic Count N) */}
          <div className="review-section">
            <h2 className="section-title">Passenger Details ({travellers.length})</h2>
            <div className="passenger-rows-list">
              {travellers.map((p, idx) => (
                <div key={p.seat || idx} className="passenger-item-row">
                  <div className="passenger-item-left">
                    <strong className="passenger-num-title">Passenger {idx + 1}</strong>
                    <span className="passenger-seat-badge">Seat {p.seat}</span>
                  </div>
                  <div className="passenger-item-right">
                    <strong className="passenger-name-val">{p.name}</strong>
                    <span className="passenger-meta-val">{p.age} yrs • {p.gender}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Mobile (Aligned with grid) */}
            <div className="grid-info-rows contact-mobile-block">
              <div className="info-row">
                <span className="info-label">Contact Mobile</span>
                <strong className="info-value">+91 {contactMobile}</strong>
              </div>
            </div>
          </div>

          <div className="section-divider" />

          {/* Section 3: Seat Details */}
          <div className="review-section">
            <h2 className="section-title">Seat Details</h2>
            <div className="grid-info-rows">
              <div className="info-row">
                <span className="info-label">Selected Seats</span>
                <strong className="info-value">{selectedSeats.join(", ")}</strong>
              </div>
              <div className="info-row">
                <span className="info-label">Total Seats</span>
                <strong className="info-value">{selectedSeats.length}</strong>
              </div>
            </div>
          </div>

          {/* Section 4: Total Amount Box (Tinted Background) */}
          <div className="total-amount-tinted-box">
            <span className="total-amount-label">Total Amount</span>
            <strong className="total-amount-val">₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        {/* Action Buttons directly below main card */}
        <div className="action-buttons-row">
          <button
            type="button"
            className="secondary-edit-btn"
            disabled={submitting}
            onClick={() => navigate(-1)}
          >
            Back / Edit
          </button>
          <button
            type="button"
            className="primary-confirm-btn"
            disabled={submitting}
            onClick={handleConfirmBooking}
          >
            {submitting ? "Confirming Booking..." : "Confirm Booking"}
          </button>
        </div>

        {/* Reserved seats footer lock note */}
        <div className="seats-reserved-footer-note">
          <span className="lock-icon">🔒</span>
          <span>Your seats are reserved for a limited time.</span>
        </div>
      </div>
    </main>
  );
}

export default BookingConfirmation;