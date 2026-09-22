import "./TripSummary.css";

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

function TripSummary({ bus, from, to, date }) {
  if (!bus) return null;

  const displayFrom = from || bus.from || "Bengaluru";
  const displayTo = to || bus.to || "Pune";
  const displayDate = formatTripDate(date || bus.date);

  return (
    <div className="trip-summary-card">
      <div className="trip-bus-identity">
        <div className="bus-name-block">
          <h2 className="trip-operator-name">{bus.operator}</h2>
          <span className="trip-bus-type">{bus.busType}</span>
        </div>
      </div>

      <div className="trip-route-timeline">
        <div className="trip-time-block departure">
          <strong className="time-text">{bus.departureTime}</strong>
          <span className="city-text">{displayFrom}</span>
        </div>

        <div className="trip-duration-line">
          <span className="duration-text">{bus.duration}</span>
          <div className="timeline-bar">
            <span className="timeline-dot start" />
            <div className="timeline-fill" />
            <span className="timeline-dot end" />
          </div>
        </div>

        <div className="trip-time-block arrival">
          <strong className="time-text">{bus.arrivalTime}</strong>
          <span className="city-text">{displayTo}</span>
        </div>
      </div>

      <div className="trip-date-block">
        <span className="trip-date-val">{displayDate}</span>
      </div>

      <div className="trip-price-block">
        <strong className="seat-price-val">₹{bus.price}</strong>
        <span className="per-seat-lbl">per seat</span>
      </div>
    </div>
  );
}

export default TripSummary;
