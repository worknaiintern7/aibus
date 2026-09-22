import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import busService from "../../services/busService";
import bookingService from "../../services/bookingService";
import BookingStepper from "../../components/BookingStepper/BookingStepper";
import TripSummary from "../../components/TripSummary/TripSummary";
import SeatLayout from "../../components/SeatLayout/SeatLayout";
import BookingSummary from "../../components/BookingSummary/BookingSummary";
import "./SeatSelection.css";

function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const busId = searchParams.get("busId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  // Fetch bus details and live seat availability from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    busService
      .getBusById(busId, { from, to, date })
      .then((bus) => {
        if (isMounted) {
          setSelectedBus(bus);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching bus details:", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [busId, from, to, date]);

  // Clear any stale seat locks when opening seat selection
  useEffect(() => {
    bookingService.clearSeatLock();
  }, []);

  if (loading) {
    return (
      <main className="seat-selection-page">
        <div className="seat-selection-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "1.2rem", color: "#666" }}>
            ⏳ Loading seat layout and availability...
          </div>
        </div>
      </main>
    );
  }

  if (!selectedBus) {
    return (
      <main className="seat-selection-page">
        <div className="seat-selection-container">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back to Search Results
          </button>
          <div className="not-found-card">
            <h1>Bus Not Found</h1>
            <p>The selected bus route or seat configuration could not be found.</p>
          </div>
        </div>
      </main>
    );
  }

  const handleSeatClick = (seatObj) => {
    const seatId = typeof seatObj === "string" ? seatObj : seatObj.id;
    const exists = selectedSeats.some(
      (s) => (typeof s === "string" ? s === seatId : s.id === seatId)
    );
    if (exists) {
      setSelectedSeats(
        selectedSeats.filter(
          (s) => (typeof s === "string" ? s !== seatId : s.id !== seatId)
        )
      );
    } else {
      setSelectedSeats([...selectedSeats, seatObj]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;

    const seatCodes = selectedSeats.map((s) =>
      typeof s === "object" ? s.display || s.id : s
    );

    // Initialize 5-minute seat lock
    bookingService.lockSeats(selectedBus.id, seatCodes, {
      from: selectedBus.from,
      to: selectedBus.to,
      date: selectedBus.date,
    });

    const params = new URLSearchParams({
      busId: selectedBus.id,
      seats: seatCodes.join(","),
      ...(selectedBus.from && { from: selectedBus.from }),
      ...(selectedBus.to && { to: selectedBus.to }),
      ...(selectedBus.date && { date: selectedBus.date }),
    });

    navigate(`/traveller-details?${params.toString()}`);
  };

  return (
    <main className="seat-selection-page">
      <div className="seat-selection-container">
        {/* Horizontal Booking Stepper */}
        <BookingStepper currentStep={1} />

        {/* Compact Trip Summary Header Strip */}
        <TripSummary bus={selectedBus} from={from} to={to} date={date} />

        {/* Main 2-Column Grid: Seat Map (Left) & Selection Card (Right) */}
        <div className="seat-selection-grid">
          {/* Left Column: Bus Seat Layout Map */}
          <div className="seat-map-column">
            <SeatLayout
              bus={selectedBus}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
            />
          </div>

          {/* Right Column: Booking Summary Card */}
          <div className="selection-card-column">
            <BookingSummary
              selectedSeats={selectedSeats}
              price={selectedBus.price}
              onClear={() => setSelectedSeats([])}
              onContinue={handleContinue}
            />
          </div>
        </div>

        {/* Mobile Sticky Bottom Floating Action Bar */}
        {selectedSeats.length > 0 && (
          <div className="mobile-seat-sticky-bar">
            <div className="mobile-sticky-left">
              <span className="mobile-seat-count-label">
                {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""} Selected:{" "}
                {selectedSeats
                  .map((s) => (typeof s === "object" ? s.display || s.id : s))
                  .join(", ")}
              </span>
              <strong className="mobile-seat-total-price">
                ₹{(selectedSeats.length * selectedBus.price).toLocaleString("en-IN")}
              </strong>
            </div>
            <button
              type="button"
              className="mobile-sticky-continue-btn"
              onClick={handleContinue}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default SeatSelection;