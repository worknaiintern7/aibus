import { useState } from "react";
import SeatLegend from "../SeatLegend/SeatLegend";
import "./SeatLayout.css";

// Helper to compute dynamic row-based price (Front premium, Middle standard, Rear discount)
export function getSeatPriceByRow(basePrice = 580, rowNum = 1) {
  if (rowNum <= 2) return basePrice + 100; // Front rows (+₹100)
  if (rowNum <= 6) return basePrice;       // Middle rows (Base)
  return Math.max(300, basePrice - 60);    // Rear rows (-₹60)
}

// Generate deterministic seat grid data based on bus layoutType and deck
function getSeatGridData(layoutType, deck = "LOWER", basePrice = 580) {
  const isUpper = deck === "UPPER";
  const deckSuffix = isUpper ? "U" : "L";

  // REAL INDIAN BUS CONVENTION (2+1): Single berth on LEFT, Double berths on RIGHT
  if (layoutType.includes("SLEEPER_2_1") || layoutType.includes("SLEEPER_COUPLE_2_1")) {
    const rows = [];
    for (let r = 1; r <= 8; r++) {
      const price = getSeatPriceByRow(basePrice, r);
      rows.push({
        rowNum: r,
        price,
        left: [
          { id: `${r}A-${deckSuffix}`, display: `${r}A`, price, rowNum: r, isWindow: true, typeLbl: "Single Berth (Window)" },
        ],
        right: [
          { id: `${r}B-${deckSuffix}`, display: `${r}B`, price, rowNum: r, isWindow: false, typeLbl: "Double Berth (Aisle)" },
          { id: `${r}C-${deckSuffix}`, display: `${r}C`, price, rowNum: r, isWindow: true, typeLbl: "Double Berth (Window)" },
        ],
      });
    }
    return { type: "SLEEPER", columns: "1+2", rows };
  }

  if (layoutType.includes("SLEEPER_2_2") || layoutType.includes("SLEEPER_COUPLE_2_2")) {
    const rows = [];
    for (let r = 1; r <= 8; r++) {
      const price = getSeatPriceByRow(basePrice, r);
      rows.push({
        rowNum: r,
        price,
        left: [
          { id: `${r}A-${deckSuffix}`, display: `${r}A`, price, rowNum: r, isWindow: true, typeLbl: "Window Berth" },
          { id: `${r}B-${deckSuffix}`, display: `${r}B`, price, rowNum: r, isWindow: false, typeLbl: "Aisle Berth" },
        ],
        right: [
          { id: `${r}C-${deckSuffix}`, display: `${r}C`, price, rowNum: r, isWindow: false, typeLbl: "Aisle Berth" },
          { id: `${r}D-${deckSuffix}`, display: `${r}D`, price, rowNum: r, isWindow: true, typeLbl: "Window Berth" },
        ],
      });
    }
    return { type: "SLEEPER", columns: "2+2", rows };
  }

  if (layoutType === "HYBRID_2_1" || layoutType === "HYBRID_2_2") {
    if (isUpper) {
      const rows = [];
      for (let r = 1; r <= 8; r++) {
        const price = getSeatPriceByRow(basePrice, r);
        rows.push({
          rowNum: r,
          price,
          left: [{ id: `${r}A-U`, display: `${r}A`, price, rowNum: r, isWindow: true, typeLbl: "Single Berth (Window)" }],
          right: [{ id: `${r}B-U`, display: `${r}B`, price, rowNum: r, isWindow: true, typeLbl: "Single Berth (Window)" }],
        });
      }
      return { type: "SLEEPER", columns: "1+1", rows };
    } else {
      const rows = [];
      for (let r = 1; r <= 8; r++) {
        const price = getSeatPriceByRow(basePrice, r);
        rows.push({
          rowNum: r,
          price,
          left: [{ id: `${r}A-L`, display: `${r}A`, price, rowNum: r, isWindow: true, typeLbl: "Single Seat (Window)" }],
          right: [
            { id: `${r}B-L`, display: `${r}B`, price, rowNum: r, isWindow: false, typeLbl: "Aisle Seat" },
            { id: `${r}C-L`, display: `${r}C`, price, rowNum: r, isWindow: true, typeLbl: "Window Seat" },
          ],
        });
      }
      return { type: "SEATER", columns: "1+2", rows };
    }
  }

  if (layoutType === "SEATER_2_1") {
    const rows = [];
    for (let r = 1; r <= 8; r++) {
      const price = getSeatPriceByRow(basePrice, r);
      rows.push({
        rowNum: r,
        price,
        left: [{ id: `${r}A`, display: `${r}A`, price, rowNum: r, isWindow: true, typeLbl: "Single Seat (Window)" }],
        right: [
          { id: `${r}B`, display: `${r}B`, price, rowNum: r, isWindow: false, typeLbl: "Aisle Seat" },
          { id: `${r}C`, display: `${r}C`, price, rowNum: r, isWindow: true, typeLbl: "Window Seat" },
        ],
      });
    }
    return { type: "SEATER", columns: "1+2", rows };
  }

  // Default: SEATER_2_2 & SEMI_SLEEPER_2_2
  const rows = [];
  for (let r = 1; r <= 8; r++) {
    const price = getSeatPriceByRow(basePrice, r);
    rows.push({
      rowNum: r,
      price,
      left: [
        { id: `${r}A`, display: `${r}A`, price, rowNum: r, isWindow: true, typeLbl: "Window Seat" },
        { id: `${r}B`, display: `${r}B`, price, rowNum: r, isWindow: false, typeLbl: "Aisle Seat" },
      ],
      right: [
        { id: `${r}C`, display: `${r}C`, price, rowNum: r, isWindow: false, typeLbl: "Aisle Seat" },
        { id: `${r}D`, display: `${r}D`, price, rowNum: r, isWindow: true, typeLbl: "Window Seat" },
      ],
    });
  }
  return {
    type: layoutType.includes("SEMI") ? "SEMI_SLEEPER" : "SEATER",
    columns: "2+2",
    rows,
  };
}

// Status assignment for seats based on backend seatsLayout if provided, else fallback
function getSeatStatus(seatId, seatsLayout) {
  if (Array.isArray(seatsLayout) && seatsLayout.length > 0) {
    const seatNumber = seatId.split("-")[0]; // e.g. "1A-L" -> "1A"
    const found = seatsLayout.find((s) => s.seatNumber === seatNumber || s.seatNumber === seatId);
    if (found) {
      if (found.status === "BOOKED") return "BOOKED_MALE";
      if (found.status === "BLOCKED") return "BLOCKED";
      if (found.status === "AVAILABLE") return "AVAILABLE";
    }
  }

  const upper = seatId.toUpperCase();
  if (upper.includes("3A") || upper.includes("3L") || upper.includes("3C")) return "BLOCKED";
  if (upper.includes("2B") || upper.includes("2U") || upper.includes("11L")) return "BOOKED_MALE";
  if (upper.includes("6B") || upper.includes("6U") || upper.includes("15L")) return "BOOKED_FEMALE";
  return "AVAILABLE";
}

// Helper to find adjacent seat ID in pair
function getAdjacentSeatId(seatId) {
  const upper = seatId.toUpperCase();
  if (upper.includes("B")) return upper.replace("B", "C");
  if (upper.includes("C")) return upper.replace("C", "B");
  if (upper.includes("D")) return upper.replace("D", "E");
  if (upper.includes("E")) return upper.replace("E", "D");
  return null;
}

function SingleBusFrame({ deckTitle, gridData, selectedSeats, onSeatClick, seatsLayout }) {
  return (
    <div className="bus-deck-column">
      <div className="deck-title-lbl">{deckTitle}</div>

      <div className={`bus-body-frame ${gridData.type.toLowerCase()}-mode`}>
        <div className="bus-interior-grid">
          {gridData.rows.map((row, rIdx) => (
            <div key={rIdx} className="bus-interior-row">
              {/* Left Group */}
              <div className="berth-group left-group">
                {row.left.map((seat) => {
                  const defaultStatus = getSeatStatus(seat.id, seatsLayout);
                  const isSelected = selectedSeats.some((s) => (typeof s === "string" ? s === seat.id : s.id === seat.id));
                  const isOccupied =
                    defaultStatus === "BOOKED_MALE" ||
                    defaultStatus === "BOOKED_FEMALE" ||
                    defaultStatus === "BLOCKED";

                  let btnClass = `seat-element ${gridData.type.toLowerCase()}-berth`;
                  if (isSelected) btnClass += " selected";
                  else if (defaultStatus === "BOOKED_MALE") btnClass += " booked-male";
                  else if (defaultStatus === "BOOKED_FEMALE") btnClass += " booked-female";
                  else if (defaultStatus === "BLOCKED") btnClass += " blocked";
                  else btnClass += " available";

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isOccupied}
                      className={btnClass}
                      onClick={() => onSeatClick(seat)}
                      title={`Seat ${seat.display} • ${seat.typeLbl || 'Seat'} • ₹${seat.price}`}
                    >
                      <span className="seat-code-label">
                        {defaultStatus === "BLOCKED" ? "×" : seat.display}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Central Aisle Gap */}
              <div className="aisle-gap" />

              {/* Right Group */}
              <div className="berth-group right-group">
                {row.right.map((seat) => {
                  const defaultStatus = getSeatStatus(seat.id, seatsLayout);
                  const isSelected = selectedSeats.some((s) => (typeof s === "string" ? s === seat.id : s.id === seat.id));
                  const isOccupied =
                    defaultStatus === "BOOKED_MALE" ||
                    defaultStatus === "BOOKED_FEMALE" ||
                    defaultStatus === "BLOCKED";

                  let btnClass = `seat-element ${gridData.type.toLowerCase()}-berth`;
                  if (isSelected) btnClass += " selected";
                  else if (defaultStatus === "BOOKED_MALE") btnClass += " booked-male";
                  else if (defaultStatus === "BOOKED_FEMALE") btnClass += " booked-female";
                  else if (defaultStatus === "BLOCKED") btnClass += " blocked";
                  else btnClass += " available";

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={isOccupied}
                      className={btnClass}
                      onClick={() => onSeatClick(seat)}
                      title={`Seat ${seat.display} • ${seat.typeLbl || 'Seat'} • ₹${seat.price}`}
                    >
                      <span className="seat-code-label">
                        {defaultStatus === "BLOCKED" ? "×" : seat.display}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function SeatLayout({ bus, selectedSeats = [], onSeatClick }) {
  const [genderNotice, setGenderNotice] = useState("");

  const layoutType = bus?.layoutType || "SLEEPER_2_1";
  const basePrice = bus?.price || 580;
  const hasMultipleDecks =
    layoutType.includes("SLEEPER") ||
    layoutType.includes("HYBRID") ||
    bus?.busType?.toLowerCase().includes("sleeper");

  const lowerGrid = getSeatGridData(layoutType, "LOWER", basePrice);
  const upperGrid = getSeatGridData(layoutType, "UPPER", basePrice);

  const handleValidatedSeatClick = (seatObj) => {
    setGenderNotice("");

    // Automated Gender Safety Check on Adjacent Seats
    const adjacentId = getAdjacentSeatId(seatObj.id);
    if (adjacentId) {
      const adjacentStatus = getSeatStatus(adjacentId);

      if (adjacentStatus === "BOOKED_FEMALE") {
        setGenderNotice(
          `ℹ️ Female Reserved Seat: Seat ${seatObj.display} is adjacent to a female booked passenger. Please ensure female passenger details in Traveller Details.`
        );
      } else if (adjacentStatus === "BOOKED_MALE") {
        setGenderNotice(
          `ℹ️ Male Reserved Seat: Seat ${seatObj.display} is adjacent to a male booked passenger.`
        );
      }
    }

    onSeatClick(seatObj);
  };

  return (
    <div className="seat-layout-card">
      {/* Automated Gender Safety Notice Banner */}
      {genderNotice && (
        <div className="gender-warning-banner">
          <span>{genderNotice}</span>
          <button
            type="button"
            className="dismiss-warning-btn"
            onClick={() => setGenderNotice("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Driver Indicator */}
      <div className="overall-driver-bar">
        <span className="driver-steer-icon">↑</span>
        <span className="driver-lbl">Front (Driver)</span>
      </div>

      {/* Both Decks Side-by-Side */}
      {hasMultipleDecks ? (
        <div className="decks-side-by-side-row">
          <SingleBusFrame
            deckTitle="Lower Deck"
            gridData={lowerGrid}
            selectedSeats={selectedSeats}
            onSeatClick={handleValidatedSeatClick}
            seatsLayout={bus?.seatsLayout}
          />
          <SingleBusFrame
            deckTitle="Upper Deck"
            gridData={upperGrid}
            selectedSeats={selectedSeats}
            onSeatClick={handleValidatedSeatClick}
            seatsLayout={bus?.seatsLayout}
          />
        </div>
      ) : (
        <SingleBusFrame
          deckTitle="Main Deck"
          gridData={lowerGrid}
          selectedSeats={selectedSeats}
          onSeatClick={handleValidatedSeatClick}
          seatsLayout={bus?.seatsLayout}
        />
      )}

      {/* Entry / Exit Footer Bar */}
      <div className="overall-exit-bar">
        <span>Entry / Exit</span>
      </div>

      {/* Minimal Legend Bar */}
      <SeatLegend />
    </div>
  );
}

export default SeatLayout;
