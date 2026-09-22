import { useNavigate } from "react-router-dom";
import "./BusCard.css";

function AmenityIcon({ name }) {
  const iconProps = {
    className: "amenity-svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
  };

  switch (name) {
    case "WiFi":
      return (
        <svg {...iconProps}>
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      );
    case "Sleeper":
      return (
        <svg {...iconProps}>
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <circle cx="6" cy="11" r="2" />
        </svg>
      );
    case "Seater":
      return (
        <svg {...iconProps}>
          <path d="M7 13v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
          <path d="M5 13h14v4H5z" />
          <path d="M6 17v3" />
          <path d="M18 17v3" />
        </svg>
      );
    case "AC":
      return (
        <svg {...iconProps}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M20 12H2" />
          <path d="m4.93 4.93 14.14 14.14" />
          <path d="m19.07 4.93-14.14 14.14" />
        </svg>
      );
    case "Non AC":
      return (
        <svg {...iconProps}>
          <path d="M12 2v20" />
          <path d="M20 12H2" />
          <path d="m4 4 16 16" />
        </svg>
      );
    case "Charging":
      return (
        <svg {...iconProps}>
          <rect x="6" y="7" width="12" height="13" rx="2" />
          <line x1="9" y1="3" x2="9" y2="7" />
          <line x1="15" y1="3" x2="15" y2="7" />
        </svg>
      );
    case "Blanket":
      return (
        <svg {...iconProps}>
          <path d="M3 6h18v12H3z" />
          <path d="M3 10h18" />
        </svg>
      );
    case "Water Bottle":
      return (
        <svg {...iconProps}>
          <rect x="9" y="3" width="6" height="3" rx="1" />
          <path d="M7 9v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9H7z" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

function BusCard({ bus, searchFrom, searchTo, searchDate }) {
  const navigate = useNavigate();

  const handleSelectSeats = () => {
    const params = new URLSearchParams({
      busId: bus.id,
      from: bus.from || searchFrom || "Pune",
      to: bus.to || searchTo || "Mumbai",
      date: bus.date || searchDate || "",
    });
    navigate(`/seat-selection?${params.toString()}`);
  };

  const rawAmenities = bus.amenities || ["WiFi", "Charging", "Blanket", "Water Bottle"];
  const amenities = rawAmenities.filter(
    (item) => !["ac", "non ac", "sleeper", "seater"].includes(item.toLowerCase())
  );

  return (
    <article className="bus-card">
      <div className="bus-card-content">
        {/* Left Section: Operator & Bus Type */}
        <div className="bus-operator-section">
          <h3 className="operator-name">{bus.operator}</h3>
          <span className="bus-type-text">{bus.busType}</span>

          {bus.rating && (
            <div className="rating-badge">
              <span className="star-icon">★</span>
              <strong className="rating-score">{bus.rating}</strong>
              {bus.reviews && <span className="reviews-count">({bus.reviews} reviews)</span>}
            </div>
          )}
        </div>

        {/* Middle Section: Timings & Amenities */}
        <div className="bus-middle-section">
          {/* Timing & Duration Graphic */}
          <div className="bus-timing-row">
            <div className="time-block departure">
              <strong className="time-val">{bus.departureTime}</strong>
              <span className="city-name">{bus.from}</span>
            </div>

            <div className="duration-line-container">
              <span className="duration-label">{bus.duration}</span>
              <div className="line-with-dots">
                <span className="dot start-dot" />
                <div className="line" />
                <span className="dot end-dot" />
              </div>
            </div>

            <div className="time-block arrival">
              <strong className="time-val">{bus.arrivalTime}</strong>
              <span className="city-name">{bus.to}</span>
            </div>
          </div>

          {/* Amenities Row */}
          <div className="amenities-row">
            {amenities.map((item, idx) => (
              <span key={idx} className="amenity-item">
                <AmenityIcon name={item} />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right Section: Price & Compact Action Button */}
        <div className="bus-price-section">
          <div className="price-container">
            <span className="price-label">Starting from</span>
            <div className="price-amount">
              <span className="price-currency">₹</span>
              <span className="price-val">{bus.price}</span>
            </div>
          </div>

          <button
            type="button"
            className="compact-select-seats-btn"
            onClick={handleSelectSeats}
          >
            <span>Select Seats</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default BusCard;