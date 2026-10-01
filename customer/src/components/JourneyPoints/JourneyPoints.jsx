import { MapPin, Navigation, Clock, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import "./JourneyPoints.css";

function JourneyPoints({
  boardingPoints = [],
  droppingPoints = [],
  pickupId = "",
  dropoffId = "",
  sourceCity = "Departure City",
  destinationCity = "Arrival City",
  onOpenModal,
}) {
  const selectedPickup = (boardingPoints || []).find((p) => p && String(p.id) === String(pickupId));
  const selectedDropoff = (droppingPoints || []).find((p) => p && String(p.id) === String(dropoffId));

  return (
    <div className="jp-container-card">
      <div className="jp-header">
        <h3 className="jp-headline">Boarding &amp; Dropping Points</h3>
      </div>

      <div className="jp-points-wrapper">
        {/* Boarding Point Item */}
        <div
          className={`jp-item-card ${selectedPickup ? "selected" : "pending"}`}
          onClick={() => onOpenModal && onOpenModal("boarding")}
          role="button"
          tabIndex={0}
        >
          <div className="jp-item-left">
            <div className={`jp-pin-circle boarding ${selectedPickup ? "active" : ""}`}>
              <MapPin size={16} />
            </div>
            <div className="jp-item-info">
              <div className="jp-meta-row">
                <span className="jp-type-tag">Boarding ({sourceCity})</span>
                {selectedPickup?.time && (
                  <span className="jp-time-tag">
                    <Clock size={11} /> {selectedPickup.time}
                  </span>
                )}
              </div>

              {selectedPickup ? (
                <>
                  <strong className="jp-point-name">{selectedPickup.name}</strong>
                  {selectedPickup.landmark && (
                    <span className="jp-point-landmark">
                      📍 {selectedPickup.landmark}
                    </span>
                  )}
                </>
              ) : (
                <div className="jp-not-selected-row">
                  <AlertCircle size={14} className="alert-icon" />
                  <span className="jp-placeholder-text">
                    Choose pickup point in {sourceCity}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="jp-item-right">
            {selectedPickup ? (
              <span className="jp-change-btn">Change</span>
            ) : (
              <span className="jp-select-btn">
                <span>Select</span>
                <ChevronRight size={14} />
              </span>
            )}
          </div>
        </div>

        {/* Route Connecting Dot Line */}
        <div className="jp-connector-line">
          <div className="jp-line-dot" />
        </div>

        {/* Dropping Point Item */}
        <div
          className={`jp-item-card ${selectedDropoff ? "selected" : "pending"}`}
          onClick={() => onOpenModal && onOpenModal("dropping")}
          role="button"
          tabIndex={0}
        >
          <div className="jp-item-left">
            <div className={`jp-pin-circle dropping ${selectedDropoff ? "active" : ""}`}>
              <Navigation size={16} />
            </div>
            <div className="jp-item-info">
              <div className="jp-meta-row">
                <span className="jp-type-tag">Dropping ({destinationCity})</span>
                {selectedDropoff?.time && (
                  <span className="jp-time-tag">
                    <Clock size={11} /> {selectedDropoff.time}
                  </span>
                )}
              </div>

              {selectedDropoff ? (
                <>
                  <strong className="jp-point-name">{selectedDropoff.name}</strong>
                  {selectedDropoff.landmark && (
                    <span className="jp-point-landmark">
                      📍 {selectedDropoff.landmark}
                    </span>
                  )}
                </>
              ) : (
                <div className="jp-not-selected-row">
                  <AlertCircle size={14} className="alert-icon" />
                  <span className="jp-placeholder-text">
                    Choose dropoff point in {destinationCity}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="jp-item-right">
            {selectedDropoff ? (
              <span className="jp-change-btn">Change</span>
            ) : (
              <span className="jp-select-btn">
                <span>Select</span>
                <ChevronRight size={14} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JourneyPoints;
