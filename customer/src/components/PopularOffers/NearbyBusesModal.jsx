import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import busService from "../../services/busService";

const NEARBY_LOCATIONS = [
  { label: "Bengaluru (Kempegowda / Majestic)", city: "Bangalore", dest: "Chennai" },
  { label: "Chennai (Koyambedu CMBT)", city: "Chennai", dest: "Bangalore" },
  { label: "Delhi (Anand Vihar / Kashmere Gate)", city: "Delhi", dest: "Jaipur" },
  { label: "Mumbai (Dadar TT / Borivali)", city: "Mumbai", dest: "Pune" },
  { label: "Pune (Shivajinagar / Swargate)", city: "Pune", dest: "Mumbai" },
];

function NearbyBusesModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const activeLoc = NEARBY_LOCATIONS[selectedLocIndex] || NEARBY_LOCATIONS[0];
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    busService
      .searchBuses({
        from: activeLoc.city,
        to: activeLoc.dest,
        date: today,
      })
      .then((results) => {
        if (isMounted) {
          setBuses(results || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBuses([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeLoc.city, activeLoc.dest, today]);

  if (!isOpen) return null;

  const handleRefreshLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setSelectedLocIndex((prev) => (prev + 1) % NEARBY_LOCATIONS.length);
      setIsLocating(false);
    }, 400);
  };

  const filteredBuses = buses.filter((bus) => {
    if (filterType === "sleeper") return (bus.busType || "").toLowerCase().includes("sleeper");
    if (filterType === "seater") return (bus.busType || "").toLowerCase().includes("seater");
    return true;
  });

  const handleBookNow = (bus) => {
    onClose();
    if (bus.id) {
      navigate(`/seat-selection?busId=${bus.id}&from=${encodeURIComponent(bus.from)}&to=${encodeURIComponent(bus.to)}&date=${today}`);
    } else {
      const params = new URLSearchParams({
        from: bus.from,
        to: bus.to,
        date: today,
      });
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container nearby-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon badge-blue">📍</span>
            <div>
              <h3>Live Departures Near You</h3>
              <p>Real-time bus inventory retrieved directly from operator GDS</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Location Detection Bar */}
        <div className="location-detector-bar">
          <div className="location-info">
            <span className="pulse-indicator"></span>
            <div>
              <span className="location-label">CURRENT SEARCH HUB</span>
              <strong className="location-name">{activeLoc.label}</strong>
            </div>
          </div>

          <button
            type="button"
            className="refresh-location-btn"
            onClick={handleRefreshLocation}
            disabled={isLocating}
          >
            <svg
              className={isLocating ? "spin-icon" : ""}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            {isLocating ? "Switching..." : "Switch Hub"}
          </button>
        </div>

        {/* Filter Chips */}
        <div className="modal-tabs">
          <button
            type="button"
            className={`tab-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Live Buses ({buses.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${filterType === "sleeper" ? "active" : ""}`}
            onClick={() => setFilterType("sleeper")}
          >
            AC Sleeper
          </button>
          <button
            type="button"
            className={`tab-btn ${filterType === "seater" ? "active" : ""}`}
            onClick={() => setFilterType("seater")}
          >
            Seater Buses
          </button>
        </div>

        {/* Buses List */}
        <div className="modal-body-scroll">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              ⏳ Querying live GDS inventory for {activeLoc.city}...
            </div>
          ) : filteredBuses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🚌</div>
              <h4 style={{ margin: "0 0 6px", color: "#1e293b" }}>No departures found for today</h4>
              <p style={{ margin: 0, fontSize: "13px" }}>
                There are no active scheduled departures from {activeLoc.city} to {activeLoc.dest} on today&apos;s date.
              </p>
              <button
                type="button"
                className="action-btn btn-solid-blue"
                style={{ marginTop: "16px", padding: "8px 20px" }}
                onClick={() => {
                  onClose();
                  const searchBox = document.querySelector(".search-box-hero-wrapper") || document.querySelector(".search-box");
                  if (searchBox) searchBox.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Search Another Date &rarr;
              </button>
            </div>
          ) : (
            <div className="nearby-buses-list">
              {filteredBuses.map((bus) => (
                <div key={bus.id} className="nearby-bus-card">
                  <div className="bus-card-top-row">
                    <div>
                      <h4 className="bus-title">{bus.operator || "Operator"}</h4>
                      <span className="bus-type-sub">{bus.busType}</span>
                    </div>
                    <div className="bus-price-tag">
                      <span className="fare-label">Starting from</span>
                      <strong className="fare-amount">₹{bus.price}</strong>
                    </div>
                  </div>

                  <div className="bus-route-highlight">
                    <div className="route-point">
                      <span className="dot-green"></span>
                      <div>
                        <strong>{bus.from}</strong>
                        <span className="time-sub">{bus.departureTime}</span>
                      </div>
                    </div>
                    <div className="route-arrow">➔</div>
                    <div className="route-point">
                      <span className="dot-red"></span>
                      <div>
                        <strong>{bus.to}</strong>
                        <span className="time-sub">{bus.arrivalTime}</span>
                      </div>
                    </div>
                  </div>

                  {bus.boardingPoint?.name && (
                    <div className="bus-boarding-info">
                      <span className="info-icon">📍</span>
                      <span>Boarding: {bus.boardingPoint.name}</span>
                    </div>
                  )}

                  <div className="nearby-card-footer">
                    <div className="bus-badges">
                      <span className="seats-badge">💺 {bus.availableSeats} seats left</span>
                      {bus.duration && <span className="depart-badge">⏱ {bus.duration}</span>}
                    </div>
                    <button
                      type="button"
                      className="action-btn btn-solid-blue"
                      onClick={() => handleBookNow(bus)}
                    >
                      Select Seats &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <p className="footer-note">
            📍 Showing live operator inventory verified from partner GDS.
          </p>
          <button type="button" className="action-btn btn-outline-gray" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default NearbyBusesModal;
