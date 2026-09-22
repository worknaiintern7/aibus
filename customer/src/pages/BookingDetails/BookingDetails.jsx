import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import bookingService from "../../services/bookingService";
import authService from "../../services/authService";
import "./BookingDetails.css";

function BookingDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const loggedInUser = authService.getLoggedInUser();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (bookingId) {
      bookingService
        .getBookingById(bookingId)
        .then((data) => {
          if (isMounted) {
            setBooking(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${booking.bookingId}?`
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      await bookingService.cancelBooking(booking.bookingId);
      const updated = await bookingService.getBookingById(booking.bookingId);
      if (updated) {
        setBooking(updated);
      } else {
        setBooking({ ...booking, status: "Cancelled" });
      }
    } catch (err) {
      alert(err.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="booking-details-page">
        <div className="booking-details-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "1.2rem", color: "#666" }}>
            ⏳ Loading booking details...
          </div>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="booking-details-page">
        <div className="booking-details-container">
          <button
            type="button"
            className="subtle-back-btn"
            onClick={() => navigate(loggedInUser ? "/my-bookings" : "/")}
          >
            ← Back to {loggedInUser ? "My Bookings" : "Home"}
          </button>

          <div className="booking-not-found-card">
            <h1>Booking Not Found</h1>
            <p>The requested booking details could not be found.</p>
            <button type="button" onClick={() => navigate("/")}>
              Search Buses
            </button>
          </div>
        </div>
      </main>
    );
  }

  const statusStr = booking.status || "Confirmed";
  const isCancelled = statusStr.toLowerCase() === "cancelled";
  const passengers =
    Array.isArray(booking.travellers) && booking.travellers.length > 0
      ? booking.travellers
      : (booking.seats || ["4D"]).map((seat) => ({
          seat,
          name: booking.traveller?.name || "Passenger",
          age: booking.traveller?.age || "",
          gender: "Male",
        }));

  const primaryMobile =
    booking.traveller?.mobile || booking.userMobile || "9876543210";

  return (
    <main className="booking-details-page">
      <div className="booking-details-container">
        {/* Subtle Back Button */}
        <button
          type="button"
          className="subtle-back-btn"
          onClick={() => navigate(loggedInUser ? "/my-bookings" : "/")}
        >
          ← Back to {loggedInUser ? "My Bookings" : "Home"}
        </button>

        {/* Page Header Block */}
        <div className="booking-details-header">
          <div className="title-id-block">
            <h1 className="page-title">Booking Details</h1>
            <span className="booking-id-subtext">
              Booking ID: <strong className="id-val">{booking.bookingId}</strong>
            </span>
          </div>

          <span className={`status-pill-badge ${isCancelled ? "cancelled" : "confirmed"}`}>
            {statusStr}
          </span>
        </div>

        {/* Main White Card */}
        <div className="booking-details-main-card">
          {/* SECTION 1: Bus Details */}
          <section className="card-section">
            <h2 className="section-title">Bus Details</h2>
            <div className="details-two-col-grid">
              <div className="grid-cell">
                <span className="cell-label">Operator</span>
                <strong className="cell-value">{booking.bus.operator}</strong>
              </div>
              <div className="grid-cell">
                <span className="cell-label">Bus Type</span>
                <strong className="cell-value">{booking.bus.busType}</strong>
              </div>

              <div className="grid-cell">
                <span className="cell-label">From</span>
                <strong className="cell-value">{booking.bus.from}</strong>
              </div>
              <div className="grid-cell">
                <span className="cell-label">To</span>
                <strong className="cell-value">{booking.bus.to}</strong>
              </div>

              <div className="grid-cell">
                <span className="cell-label">Departure</span>
                <strong className="cell-value">{booking.bus.departureTime}</strong>
              </div>
              <div className="grid-cell">
                <span className="cell-label">Arrival</span>
                <strong className="cell-value">{booking.bus.arrivalTime}</strong>
              </div>
            </div>
          </section>

          <hr className="details-card-divider" />

          {/* SECTION 2: Traveller Details */}
          <section className="card-section">
            <h2 className="section-title">Traveller Details</h2>
            <div className="passenger-cards-stack">
              {passengers.map((p, idx) => (
                <div key={p.seat || idx} className="passenger-row-card">
                  <div className="p-left-info">
                    <span className="p-title">Passenger {idx + 1}</span>
                    <span className="p-seat-sub">Seat {p.seat}</span>
                  </div>
                  <div className="p-right-info">
                    <strong className="p-name">{p.name}</strong>
                    <span className="p-meta">
                      {p.age ? `${p.age} yrs` : ""} {p.age && p.gender ? "•" : ""}{" "}
                      {p.gender || ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-mobile-row">
              <span className="cell-label">Contact Mobile</span>
              <strong className="cell-value">
                {primaryMobile.startsWith("+") ? primaryMobile : `+91 ${primaryMobile}`}
              </strong>
            </div>
          </section>

          <hr className="details-card-divider" />

          {/* SECTION 3: Seat Details */}
          <section className="card-section">
            <h2 className="section-title">Seat Details</h2>
            <div className="details-two-col-grid">
              <div className="grid-cell">
                <span className="cell-label">Selected Seats</span>
                <strong className="cell-value">
                  {Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats}
                </strong>
              </div>
              <div className="grid-cell">
                <span className="cell-label">Total Seats</span>
                <strong className="cell-value">
                  {Array.isArray(booking.seats) ? booking.seats.length : 1}
                </strong>
              </div>
            </div>
          </section>

          {/* SECTION 4: Total Amount Highlight Box */}
          <div className="total-amount-pink-box">
            <span className="total-label">Total Amount</span>
            <strong className="total-val">₹{booking.totalAmount}</strong>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="booking-details-actions-row">
          <button
            type="button"
            className="btn-secondary-outline"
            onClick={() => navigate(loggedInUser ? "/my-bookings" : "/")}
          >
            Back to {loggedInUser ? "My Bookings" : "Home"}
          </button>

          {!isCancelled && (
            <button
              type="button"
              className="btn-primary-red"
              disabled={cancelling}
              onClick={handleCancelBooking}
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default BookingDetails;