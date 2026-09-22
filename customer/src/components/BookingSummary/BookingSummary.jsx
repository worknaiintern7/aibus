import "./BookingSummary.css";

function BookingSummary({ selectedSeats = [], price = 580, onClear, onContinue }) {
  const hasSeats = selectedSeats.length > 0;

  // Calculate actual total sum from selected seat objects (or default to count * price)
  const totalAmount = hasSeats
    ? selectedSeats.reduce((sum, s) => sum + (typeof s === "object" ? s.price : price), 0)
    : 0;

  // Format selected seats with seat display names
  const formatSelectedSeats = () => {
    if (!hasSeats) return "None";
    return selectedSeats
      .map((s) => (typeof s === "object" ? s.display || s.id : s))
      .join(", ");
  };

  const hasLowerDeck = selectedSeats.some((s) => {
    const id = typeof s === "object" ? s.id : s;
    return id.endsWith("L") || id.includes("-L") || id.startsWith("L");
  });

  const hasUpperDeck = selectedSeats.some((s) => {
    const id = typeof s === "object" ? s.id : s;
    return id.endsWith("U") || id.includes("-U") || id.startsWith("U");
  });

  let deckLabel = "";
  if (hasLowerDeck && hasUpperDeck) deckLabel = "(Lower & Upper Deck)";
  else if (hasLowerDeck) deckLabel = "(Lower Deck)";
  else if (hasUpperDeck) deckLabel = "(Upper Deck)";

  return (
    <div className="selection-summary-card">
      <div className="selection-header">
        <h3 className="selection-title">Your Selection</h3>
        {hasSeats && (
          <button type="button" className="clear-selection-btn" onClick={onClear}>
            Clear
          </button>
        )}
      </div>

      <div className="selection-body">
        <div className="selection-row">
          <span className="row-label">Selected Seats</span>
          <div className="seat-value-block">
            <strong className="seat-numbers">{formatSelectedSeats()}</strong>
            {hasSeats && deckLabel && <span className="deck-sublabel">{deckLabel}</span>}
          </div>
        </div>

        <div className="selection-divider" />

        <div className="selection-row">
          <span className="row-label">Base fare from</span>
          <span className="price-val">₹{price}</span>
        </div>

        <div className="total-amount-row">
          <span className="total-label">Total Amount</span>
          <strong className="total-price-val">₹{totalAmount}</strong>
        </div>

        <button
          type="button"
          disabled={!hasSeats}
          className="proceed-btn"
          onClick={onContinue}
        >
          <span>Proceed to Traveller Details</span>
          <span className="arrow">→</span>
        </button>

        <div className="selection-tip-box">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            Front rows (+₹100) & Rear rows (-₹60) have location-based pricing.
          </span>
        </div>
      </div>
    </div>
  );
}

export default BookingSummary;
