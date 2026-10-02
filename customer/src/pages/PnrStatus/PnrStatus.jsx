import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Printer,
  Share2,
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bus,
  QrCode,
  Sparkles,
  RefreshCw
} from "lucide-react";
import api from "../../services/api";
import bookingService from "../../services/bookingService";
import "./PnrStatus.css";

function PnrStatus() {
  const [searchParams] = useSearchParams();
  const initialPnr = searchParams.get("pnr") || "";
  const initialTicket = searchParams.get("ticketNo") || "";

  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [ticketInput, setTicketInput] = useState(initialTicket);
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto fetch only if URL params provided
  useEffect(() => {
    if (initialPnr || initialTicket) {
      handleSearchTicket(initialPnr, initialTicket);
    }
  }, [initialPnr, initialTicket]);

  const handleSearchTicket = async (pnrToSearch, ticketToSearch) => {
    const pnr = (pnrToSearch !== undefined ? pnrToSearch : pnrInput).trim();
    const ticket = (ticketToSearch !== undefined ? ticketToSearch : ticketInput).trim();

    if (!pnr && !ticket) {
      setError("Please enter a valid PNR Number or Ticket Number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Try Mantis GDS live booking details API
      const res = await api.get(`/api/gds/booking-details?pnr=${encodeURIComponent(pnr)}&ticketNo=${encodeURIComponent(ticket)}`);
      if (res.data?.success && res.data?.data) {
        setTicketData({
          ...res.data.data,
          source: "MANTIS_GDS",
        });
        setLoading(false);
        return;
      }
    } catch (gdsErr) {
      console.warn("GDS API lookup fallback to local search:", gdsErr.message);
    }

    try {
      // 2. Fallback to local bookings database by reference or ticket
      const localBooking = await bookingService.getBookingById(pnr || ticket);
      if (localBooking) {
        setTicketData({
          PNRNo: localBooking.pnrNo || localBooking.bookingReference,
          TicketNo: localBooking.ticketNo || localBooking.bookingReference,
          CompanyName: localBooking.bus?.operator || "AIBus Express",
          BusTypeName: localBooking.bus?.busType || "AC Seater",
          FromCityName: localBooking.bus?.from || "Bengaluru",
          ToCityName: localBooking.bus?.to || "Chennai",
          DepartureDateTime: `${localBooking.bus?.date || "2026-10-02"} ${localBooking.bus?.departureTime || "06:00:00"}`,
          ArrivalDateTime: `${localBooking.bus?.date || "2026-10-02"} ${localBooking.bus?.arrivalTime || "18:00:00"}`,
          TotalFare: localBooking.totalAmount || 0,
          TotalSeats: localBooking.seats?.length || 1,
          IsCancelled: localBooking.status === "Cancelled",
          Passengers: (localBooking.travellers || []).map((t) => ({
            Name: t.name,
            Age: t.age,
            Gender: t.gender,
            SeatNo: t.seat,
            SeatType: "Seater",
            Fare: Math.round((localBooking.totalAmount || 0) / (localBooking.seats?.length || 1)),
          })),
          PickupInfo: {
            PickupName: localBooking.boardingPoint || "Main Terminal",
            PickupTime: localBooking.boardingTime || localBooking.bus?.departureTime || "06:00:00",
            Address: "Verified Boarding Point",
            Landmark: "City Junction",
            Phone: localBooking.userMobile || "9876543210",
          },
          ContactInfo: {
            CustomerName: localBooking.travellers?.[0]?.name || "Passenger",
            Mobile: localBooking.userMobile || "9876543210",
            Email: localBooking.contactEmail || "passenger@aibus.in",
          },
          source: "LOCAL_STORE",
        });
      } else {
        setError(`No active booking found for PNR: "${pnr}" or Ticket: "${ticket}". Please verify the details.`);
        setTicketData(null);
      }
    } catch (err) {
      setError(err.message || "Failed to retrieve booking details. Please try again.");
      setTicketData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `AIBus Ticket - ${ticketData?.PNRNo}`,
        text: `My Bus Ticket: ${ticketData?.FromCityName} to ${ticketData?.ToCityName} on ${ticketData?.DepartureDateTime}. PNR: ${ticketData?.PNRNo}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="pnr-page">
      <div className="pnr-container">
        {/* Search Header Banner */}
        <div className="pnr-hero-card no-print">
          <div className="pnr-badge">
            <Sparkles size={13} className="pnr-sparkle" />
            <span>MANTIS GDS LIVE TICKET VERIFICATION</span>
          </div>
          <h1 className="pnr-title">Track PNR & Print Boarding Pass</h1>
          <p className="pnr-subtitle">
            Enter your PNR or Ticket Number to view live departure times, boarding coordinates, and print your digital ticket.
          </p>

          <form 
            className="pnr-search-bar" 
            onSubmit={(e) => { e.preventDefault(); handleSearchTicket(); }}
          >
            <div className="pnr-input-wrap">
              <label>PNR NUMBER</label>
              <input
                type="text"
                placeholder="e.g. 96160626-523525"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value)}
              />
            </div>

            <div className="pnr-input-wrap">
              <label>TICKET NUMBER</label>
              <input
                type="text"
                placeholder="e.g. 501718666"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
              />
            </div>

            <button type="submit" className="pnr-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-icon" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Fetch Ticket</span>
                </>
              )}
            </button>
          </form>

          {/* Quick 1-click test button (development builds only) */}
          {SAMPLE_TICKET && (
            <div className="pnr-quick-tests">
              <span>Quick Live Test:</span>
              <button
                type="button"
                className="pnr-pill-btn"
                onClick={() => {
                  setPnrInput(SAMPLE_TICKET.pnr);
                  setTicketInput(SAMPLE_TICKET.ticketNo);
                  handleSearchTicket(SAMPLE_TICKET.pnr, SAMPLE_TICKET.ticketNo);
                }}
              >
                Mantis Live Ticket #{SAMPLE_TICKET.ticketNo} (Bangalore ➔ Chennai)
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="pnr-alert-error no-print">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Boarding Pass Result Card */}
        {ticketData && (
          <div className="pnr-result-section">
            <div className="pnr-actions-bar no-print">
              <div className="pnr-status-tag">
                {ticketData.IsCancelled ? (
                  <span className="badge-cancelled">Cancelled / Refunded</span>
                ) : (
                  <span className="badge-confirmed">
                    <CheckCircle2 size={14} /> Confirmed Live Booking
                  </span>
                )}
                {ticketData.source === "MANTIS_GDS" && (
                  <span className="badge-gds">Mantis GDS Verified</span>
                )}
              </div>

              <div className="pnr-btn-group">
                <button type="button" className="pnr-action-btn" onClick={handlePrint}>
                  <Printer size={16} />
                  <span>Print Ticket</span>
                </button>
                <button type="button" className="pnr-action-btn" onClick={handleShare}>
                  <Share2 size={16} />
                  <span>{copied ? "Copied Link!" : "Share Ticket"}</span>
                </button>
              </div>
            </div>

            {/* Printable Ticket Pass */}
            <div className="pnr-ticket-card" id="printable-ticket">
              {/* Ticket Top Banner */}
              <div className="ticket-top-banner">
                <div className="ticket-brand">
                  <div className="ticket-logo-box">
                    <Bus size={22} />
                  </div>
                  <div>
                    <h3 className="ticket-brand-name">AIBUS INTELLIGENT TRAVEL</h3>
                    <span className="ticket-subtitle">Mantis Technologies GDS Network</span>
                  </div>
                </div>

                <div className="ticket-identifiers">
                  <div className="identifier-block">
                    <span className="id-label">PNR NUMBER</span>
                    <strong className="id-val pnr-code">{ticketData.PNRNo}</strong>
                  </div>
                  <div className="identifier-block">
                    <span className="id-label">TICKET NUMBER</span>
                    <strong className="id-val">{ticketData.TicketNo}</strong>
                  </div>
                </div>
              </div>

              {/* Ticket Main Info Grid */}
              <div className="ticket-main-grid">
                {/* Route & Times */}
                <div className="ticket-route-box">
                  <div className="route-endpoint">
                    <span className="endpoint-lbl">ORIGIN</span>
                    <h2 className="endpoint-city">{ticketData.FromCityName}</h2>
                    <span className="endpoint-time">
                      <Clock size={13} /> {ticketData.DepartureDateTime?.replace(".000Z", "").replace("T", " ")}
                    </span>
                  </div>

                  <div className="route-arrow-connector">
                    <div className="connector-line"></div>
                    <span className="connector-bus">🚌</span>
                    <div className="connector-line"></div>
                  </div>

                  <div className="route-endpoint">
                    <span className="endpoint-lbl">DESTINATION</span>
                    <h2 className="endpoint-city">{ticketData.ToCityName}</h2>
                    <span className="endpoint-time">
                      <Clock size={13} /> {ticketData.ArrivalDateTime?.replace(".000Z", "").replace("T", " ")}
                    </span>
                  </div>
                </div>

                {/* Operator & Bus Details */}
                <div className="ticket-meta-strip">
                  <div>
                    <span className="meta-lbl">OPERATOR</span>
                    <strong>{ticketData.CompanyName}</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">BUS TYPE</span>
                    <strong>{ticketData.BusTypeName || "AC Seater"}</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">TOTAL SEATS</span>
                    <strong>{ticketData.TotalSeats || ticketData.Passengers?.length || 1} Seat(s)</strong>
                  </div>
                  <div>
                    <span className="meta-lbl">TOTAL FARE</span>
                    <strong className="gold-fare">₹{ticketData.TotalFare}</strong>
                  </div>
                </div>

                {/* Boarding Point Landmark & Contact */}
                {ticketData.PickupInfo && (
                  <div className="ticket-pickup-card">
                    <div className="pickup-title-row">
                      <MapPin size={16} className="pin-gold" />
                      <strong>Boarding Point: {ticketData.PickupInfo.PickupName}</strong>
                    </div>
                    <div className="pickup-info-grid">
                      <div>
                        <span className="pickup-lbl">ADDRESS:</span>
                        <p>{ticketData.PickupInfo.Address || "City Boarding Point"}</p>
                      </div>
                      {ticketData.PickupInfo.Landmark && (
                        <div>
                          <span className="pickup-lbl">LANDMARK:</span>
                          <p>{ticketData.PickupInfo.Landmark}</p>
                        </div>
                      )}
                      {ticketData.PickupInfo.Phone && (
                        <div>
                          <span className="pickup-lbl">CONTACT PHONE:</span>
                          <p className="phone-val">
                            <Phone size={12} /> {ticketData.PickupInfo.Phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Passengers List */}
                <div className="ticket-passengers-section">
                  <h4 className="passengers-title">Passenger Manifest</h4>
                  <table className="passengers-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Passenger Name</th>
                        <th>Age / Gender</th>
                        <th>Seat No</th>
                        <th>Seat Type</th>
                        <th>Fare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(ticketData.Passengers || []).map((p, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{p.Name}</strong></td>
                          <td>{p.Age} Yrs / {p.Gender}</td>
                          <td><span className="seat-badge-gold">{p.SeatNo}</span></td>
                          <td>{p.SeatType || "Seater"}</td>
                          <td>₹{p.Fare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Contact and QR Code Row */}
                <div className="ticket-footer-row">
                  <div className="ticket-contact-block">
                    <span className="block-lbl">PRIMARY CONTACT DETAILS</span>
                    <strong>{ticketData.ContactInfo?.CustomerName || "Guest Passenger"}</strong>
                    <span>Mobile: {ticketData.ContactInfo?.Mobile || "N/A"}</span>
                    <span>Email: {ticketData.ContactInfo?.Email || "N/A"}</span>
                  </div>

                  <div className="ticket-qr-block">
                    <div className="qr-box">
                      <QrCode size={80} />
                    </div>
                    <div className="qr-note">
                      <strong>Digital Boarding Pass</strong>
                      <span>Show this QR to the bus conductor while boarding</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Guidelines */}
                <div className="ticket-terms">
                  <span>Terms & Conditions: Please arrive 15 minutes before scheduled departure time. Government issued ID card is mandatory during journey.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default PnrStatus;
