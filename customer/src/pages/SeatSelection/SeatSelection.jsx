import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import busService from "../../services/busService";
import bookingService from "../../services/bookingService";
import BookingStepper from "../../components/BookingStepper/BookingStepper";
import TripSummary from "../../components/TripSummary/TripSummary";
import SeatLayout from "../../components/SeatLayout/SeatLayout";
import BookingSummary from "../../components/BookingSummary/BookingSummary";
import JourneyPoints from "../../components/JourneyPoints/JourneyPoints";
import BoardingDroppingModal from "../../components/BoardingDroppingModal/BoardingDroppingModal";
import "./SeatSelection.css";

function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected boarding and dropping points
  const [pickupId, setPickupId] = useState("");
  const [dropoffId, setDropoffId] = useState("");

  // Modal controls
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState("boarding");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const busId = searchParams.get("busId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const pickupParam = searchParams.get("pickup");

  // Fetch bus details and live seat availability from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    busService
      .getBusById(busId, { from, to, date })
      .then((bus) => {
        if (isMounted) {
          setSelectedBus(bus);
          if (bus) {
            const bPoints = bus.boardingPoints || [];
            // If user explicitly chose a boarding point on the search results bus card
            const preselectedPickup = pickupParam ? bPoints.find((p) => p.id === pickupParam) : null;
            if (preselectedPickup) {
              setPickupId(preselectedPickup.id);
            } else {
              setPickupId(""); // Not chosen yet!
            }

            // Dropping point starts unselected
            setDropoffId("");
          }
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
  }, [busId, from, to, date, pickupParam]);

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

  const isLive = Boolean(selectedBus.isLive);
  const selectedTotal = selectedSeats.reduce(
    (sum, s) => sum + (typeof s === "object" ? s.price : selectedBus.price),
    0
  );

  const hasSeats = selectedSeats.length > 0;
  const hasBothPoints = Boolean(pickupId && dropoffId);

  // Navigate to Traveller Details with locked seats and chosen points
  const proceedToTravellerDetails = (finalPickup = pickupId, finalDropoff = dropoffId) => {
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
      ...(finalPickup && { pickup: finalPickup }),
      ...(finalDropoff && { dropoff: finalDropoff }),
    });

    navigate(`/traveller-details?${params.toString()}`);
  };

  // Called when user clicks "Proceed" or mobile continue button
  const handleProceedClick = () => {
    if (!hasSeats) return;

    // If boarding point was not selected, open modal on Boarding tab
    if (!pickupId) {
      setModalInitialTab("boarding");
      setIsPointsModalOpen(true);
      return;
    }

    // If boarding point was selected but dropping was not, open modal on Dropping tab
    if (!dropoffId) {
      setModalInitialTab("dropping");
      setIsPointsModalOpen(true);
      return;
    }

    // Both are already selected!
    proceedToTravellerDetails(pickupId, dropoffId);
  };

  const handlePointsConfirmed = ({ pickupId: newPickup, dropoffId: newDropoff }) => {
    setPickupId(newPickup);
    setDropoffId(newDropoff);
    setIsPointsModalOpen(false);
    // If seats are already selected, proceed directly to traveller details
    if (selectedSeats && selectedSeats.length > 0) {
      proceedToTravellerDetails(newPickup, newDropoff);
    }
  };

  const getButtonText = () => {
    if (!hasSeats) return "Select Seats to Proceed";
    if (!pickupId && !dropoffId) return "Select Boarding & Dropping Points →";
    if (!pickupId) return "Select Boarding Point →";
    if (!dropoffId) return "Select Dropping Point →";
    return "Proceed to Traveller Details →";
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

          {/* Right Column: Points & Booking Summary Card */}
          <div className="selection-card-column">
            <JourneyPoints
              boardingPoints={selectedBus.boardingPoints || []}
              droppingPoints={selectedBus.droppingPoints || []}
              pickupId={pickupId}
              dropoffId={dropoffId}
              sourceCity={selectedBus.from || from || "Departure"}
              destinationCity={selectedBus.to || to || "Arrival"}
              onOpenModal={(tab) => {
                setModalInitialTab(tab || "boarding");
                setIsPointsModalOpen(true);
              }}
            />

            <BookingSummary
              selectedSeats={selectedSeats}
              price={selectedBus.price}
              isLive={isLive}
              canContinue={hasSeats}
              buttonText={getButtonText()}
              onClear={() => setSelectedSeats([])}
              onContinue={handleProceedClick}
            />
          </div>
        </div>

        {/* Mobile Sticky Bottom Floating Action Bar */}
        {hasSeats && (
          <div className="mobile-seat-sticky-bar">
            <div className="mobile-sticky-left">
              <span className="mobile-seat-count-label">
                {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""} Selected:{" "}
                {selectedSeats
                  .map((s) => (typeof s === "object" ? s.display || s.id : s))
                  .join(", ")}
              </span>
              <strong className="mobile-seat-total-price">
                ₹{selectedTotal.toLocaleString("en-IN")}
              </strong>
            </div>
            <button
              type="button"
              className="mobile-sticky-continue-btn"
              onClick={handleProceedClick}
            >
              {hasBothPoints ? "Continue →" : "Select Points →"}
            </button>
          </div>
        )}

        {/* Multi-step Boarding & Dropping Point Visual Modal */}
        <BoardingDroppingModal
          isOpen={isPointsModalOpen}
          onClose={() => setIsPointsModalOpen(false)}
          sourceCity={selectedBus.from || from || "Departure City"}
          destinationCity={selectedBus.to || to || "Arrival City"}
          boardingPoints={selectedBus.boardingPoints || []}
          droppingPoints={selectedBus.droppingPoints || []}
          selectedPickupId={pickupId}
          selectedDropoffId={dropoffId}
          initialTab={modalInitialTab}
          onConfirm={handlePointsConfirmed}
        />
      </div>
    </main>
  );
}

export default SeatSelection;