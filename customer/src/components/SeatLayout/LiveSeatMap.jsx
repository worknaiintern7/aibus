import { useState } from "react";
import "./SeatLayout.css";
import "./LiveSeatMap.css";

const DECK_TITLES = { LOWER: "Lower Deck", UPPER: "Upper Deck" };

function seatTypeLabel(type) {
  if (type === "SLEEPER") return "Sleeper berth";
  if (type === "SEMI_SLEEPER") return "Semi sleeper";
  return "Seat";
}

// One deck drawn from the operator's real chart: every seat sits on its own grid cell
function LiveDeck({ deck, title, showFares, selectedSeats, onSeatClick, showSteering }) {
  return (
    <div className="bus-deck-column">
      <div className="deck-title-lbl">{title}</div>

      <div className="bus-body-frame live-bus-frame">
        <div className="live-front-row">
          {showSteering ? (
            <span className="live-steering" title="Driver" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2.2" />
                <path d="M12 14.2V21M9.9 11.3 3.6 9.2M14.1 11.3l6.3-2.1" />
              </svg>
            </span>
          ) : (
            <span className="live-front-spacer" />
          )}
        </div>

        <div
          className="live-seat-grid"
          style={{
            gridTemplateColumns: `repeat(${deck.columns}, var(--live-cell))`,
            gridTemplateRows: `repeat(${deck.rows}, var(--live-cell))`,
          }}
        >
          {deck.seats.map((seat) => {
            const isSelected = selectedSeats.some(
              (s) => (typeof s === "string" ? s : s.id) === seat.seatNumber
            );
            const isBooked = seat.status !== "AVAILABLE";

            let stateClass = "available";
            if (isSelected) stateClass = "selected";
            else if (isBooked && seat.bookedBy === "FEMALE") stateClass = "booked-female";
            else if (isBooked && seat.bookedBy === "MALE") stateClass = "booked-male";
            else if (isBooked) stateClass = "live-booked";
            else if (seat.reservedFor === "FEMALE") stateClass = "available live-ladies";
            else if (seat.reservedFor === "MALE") stateClass = "available live-gents";

            const fare = Number(seat.fare || 0);
            const reservedNote =
              seat.reservedFor === "FEMALE"
                ? ", reserved for female passengers"
                : seat.reservedFor === "MALE"
                ? ", reserved for male passengers"
                : "";
            const label = `${seatTypeLabel(seat.seatType)} ${seat.seatNumber}, ${
              isBooked ? "booked" : `₹${fare}${reservedNote}`
            }`;

            return (
              <button
                key={seat.seatNumber}
                type="button"
                disabled={isBooked}
                aria-pressed={isSelected}
                aria-label={label}
                title={label}
                className={`seat-element live-seat live-${seat.seatType.toLowerCase()} ${stateClass}`}
                style={{
                  gridRow: `${seat.row + 1} / span ${seat.height}`,
                  gridColumn: `${seat.column + 1} / span ${seat.width}`,
                }}
                onClick={() =>
                  onSeatClick({
                    id: seat.seatNumber,
                    display: seat.seatNumber,
                    price: fare,
                    deck: deck.name,
                    reservedFor: seat.reservedFor || null,
                    typeLbl: seatTypeLabel(seat.seatType),
                  })
                }
              >
                <span className="seat-code-label">{seat.seatNumber}</span>
                {showFares && !isBooked && <span className="live-seat-fare">₹{fare}</span>}
                {seat.seatType === "SLEEPER" && <span className="live-pillow" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LiveSeatMap({ bus, selectedSeats = [], onSeatClick }) {
  const [notice, setNotice] = useState("");
  const [activeMobileDeck, setActiveMobileDeck] = useState("LOWER");

  const decks = bus.decks || [];
  const maxSeats = bus.maxSeats || 6;
  const hasMultipleDecks = decks.length > 1;

  const allSeats = decks.flatMap((deck) => deck.seats);
  const availableCount = allSeats.filter((s) => s.status === "AVAILABLE").length;
  const uniqueFares = new Set(
    allSeats.filter((s) => s.status === "AVAILABLE").map((s) => Number(s.fare || 0))
  );
  const hasSleeper = allSeats.some((s) => s.seatType === "SLEEPER");
  // Berths have room for the fare; small seats only show it when fares differ
  const showFares = hasSleeper || uniqueFares.size > 1;
  const hasLadiesSeats = allSeats.some((s) => s.reservedFor === "FEMALE" || s.bookedBy === "FEMALE");
  const hasGentsSeats = allSeats.some((s) => s.reservedFor === "MALE" || s.bookedBy === "MALE");

  const handleSeatClick = (seatObj) => {
    const alreadySelected = selectedSeats.some(
      (s) => (typeof s === "string" ? s : s.id) === seatObj.id
    );

    if (!alreadySelected && selectedSeats.length >= maxSeats) {
      setNotice(`You can book up to ${maxSeats} seats in one booking.`);
      return;
    }

    if (!alreadySelected && seatObj.reservedFor === "FEMALE") {
      setNotice(`Seat ${seatObj.display} is reserved for female passengers.`);
    } else if (!alreadySelected && seatObj.reservedFor === "MALE") {
      setNotice(`Seat ${seatObj.display} is reserved for male passengers.`);
    } else {
      setNotice("");
    }

    onSeatClick(seatObj);
  };

  return (
    <div className="seat-layout-card live-seat-card">
      <div className="live-map-header">
        <div className="live-map-title-block">
          <h2 className="live-map-title">Select your seats</h2>
          <span className="live-map-sub">
            {availableCount} of {allSeats.length} seats available
          </span>
        </div>
        <span className="live-chart-pill">
          <span className="live-dot" />
          Live seat chart
        </span>
      </div>

      {notice && (
        <div className="gender-warning-banner" role="status">
          <span>{notice}</span>
          <button
            type="button"
            className="dismiss-warning-btn"
            aria-label="Dismiss"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}

      {hasMultipleDecks && (
        <div className="mobile-deck-switcher-tabs">
          {decks.map((deck) => (
            <button
              key={deck.name}
              type="button"
              className={`deck-tab-btn ${activeMobileDeck === deck.name ? "active" : ""}`}
              onClick={() => setActiveMobileDeck(deck.name)}
            >
              {DECK_TITLES[deck.name] || deck.name}
            </button>
          ))}
        </div>
      )}

      <div
        className={
          hasMultipleDecks
            ? `decks-side-by-side-row live-decks-row show-${activeMobileDeck.toLowerCase()}-on-mobile`
            : "live-single-deck"
        }
      >
        {decks.map((deck, idx) => (
          <LiveDeck
            key={deck.name}
            deck={deck}
            title={hasMultipleDecks ? DECK_TITLES[deck.name] || deck.name : "Front of bus"}
            showFares={showFares}
            showSteering={idx === 0}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        ))}
      </div>

      <div className="seat-legend-bar live-legend">
        <div className="legend-item">
          <span className="legend-sample available" />
          <span className="legend-text">Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-sample selected" />
          <span className="legend-text">Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-sample live-booked" />
          <span className="legend-text">Booked</span>
        </div>
        {hasLadiesSeats && (
          <div className="legend-item">
            <span className="legend-sample live-ladies" />
            <span className="legend-text">Ladies only</span>
          </div>
        )}
        {hasGentsSeats && (
          <div className="legend-item">
            <span className="legend-sample live-gents" />
            <span className="legend-text">Gents only</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveSeatMap;
