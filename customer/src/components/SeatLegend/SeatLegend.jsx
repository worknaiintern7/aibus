import "./SeatLegend.css";

function SeatLegend() {
  return (
    <div className="seat-legend-bar">
      <div className="legend-item">
        <span className="legend-sample available" />
        <span className="legend-text">Available</span>
      </div>

      <div className="legend-item">
        <span className="legend-sample selected" />
        <span className="legend-text">Selected</span>
      </div>

      <div className="legend-item">
        <span className="legend-sample booked-male" />
        <span className="legend-text">Booked (Male)</span>
      </div>

      <div className="legend-item">
        <span className="legend-sample booked-female" />
        <span className="legend-text">Booked (Female)</span>
      </div>

      <div className="legend-item">
        <span className="legend-sample blocked" />
        <span className="legend-text">Blocked</span>
      </div>
    </div>
  );
}

export default SeatLegend;
