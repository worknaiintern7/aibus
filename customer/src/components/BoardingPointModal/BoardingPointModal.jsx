import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./BoardingPointModal.css";

function BoardingPointModal({
  isOpen,
  onClose,
  cityName = "Pune",
  boardingPoints = [],
  selectedPoint = null,
  onSelectPoint,
}) {
  const points = boardingPoints && boardingPoints.length > 0
    ? boardingPoints
    : [
        {
          id: "bp-1",
          name: `${cityName} Central Bus Stand`,
          time: "08:00 AM",
          area: "City Center",
          address: `${cityName}, Station Road`,
          landmark: "Near Main Gate",
          latitude: 18.5308,
          longitude: 73.8475,
        },
      ];

  const [activePoint, setActivePoint] = useState(selectedPoint || points[0]);

  useEffect(() => {
    if (selectedPoint) {
      setActivePoint(selectedPoint);
    } else if (points.length > 0) {
      setActivePoint(points[0]);
    }
  }, [selectedPoint, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = activePoint || points[0];
  const latNum = Number(current.latitude || 18.5308);
  const lonNum = Number(current.longitude || 73.8475);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latNum},${lonNum}`;

  // OpenStreetMap embed bounding box
  const delta = 0.005;
  const bbox = `${lonNum - delta}%2C${latNum - delta}%2C${lonNum + delta}%2C${latNum + delta}`;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum}%2C${lonNum}`;

  const handleConfirmSelection = () => {
    if (onSelectPoint) {
      onSelectPoint(current);
    }
    onClose();
  };

  return createPortal(
    <div className="boarding-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="boarding-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="boarding-modal-title"
      >
        {/* Mobile handle grab indicator */}
        <div className="boarding-modal-grab-bar" />

        {/* Modal Header */}
        <div className="boarding-modal-header">
          <div className="header-info-group">
            <div className="boarding-modal-tag">
              <span className="pin-symbol">📍</span>
              <span>Select Boarding Point • {cityName}</span>
            </div>
            <h2 id="boarding-modal-title" className="boarding-modal-headline">
              Choose your nearest pickup location
            </h2>
          </div>
          <button
            type="button"
            className="boarding-modal-close-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="boarding-modal-body">
          {/* List of Multiple Boarding Points */}
          <div className="boarding-points-list-container">
            <span className="points-list-label">
              Available Locations ({points.length}):
            </span>
            <div className="boarding-points-cards-list">
              {points.map((pt) => {
                const isSelected = (current.id && pt.id === current.id) || pt.name === current.name;
                return (
                  <div
                    key={pt.id || pt.name}
                    className={`boarding-point-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setActivePoint(pt)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="point-card-radio">
                      <div className={`radio-outer ${isSelected ? "checked" : ""}`}>
                        {isSelected && <div className="radio-inner" />}
                      </div>
                    </div>

                    <div className="point-card-content">
                      <div className="point-name-row">
                        <strong className="point-title">{pt.name}</strong>
                        {pt.time && <span className="point-time-badge">{pt.time}</span>}
                      </div>

                      {pt.area && (
                        <span className="point-area-tag">📍 {pt.area}</span>
                      )}

                      <span className="point-landmark-snippet">
                        {pt.landmark || pt.address}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="selected-badge">Selected</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Map for Active Point */}
          <div className="boarding-active-map-section">
            <div className="map-header-row">
              <span className="map-title-label">
                Visual Location: <strong>{current.name}</strong>
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="directions-link-btn"
                title="Open in Google Maps"
              >
                Get Directions ↗
              </a>
            </div>

            <div className="boarding-map-wrapper">
              <iframe
                title={`Map showing ${current.name}`}
                className="boarding-map-frame"
                src={mapEmbedUrl}
                loading="lazy"
              />
              <div className="boarding-marker-badge">
                <span className="pulse-dot" />
                <span>{current.name}</span>
              </div>
            </div>

            {/* Landmark & Short Address */}
            <div className="boarding-landmark-box">
              <div className="landmark-item">
                <span className="landmark-label">Landmark:</span>
                <strong className="landmark-value">{current.landmark}</strong>
              </div>
              <div className="landmark-item address-item">
                <span className="landmark-label">Address:</span>
                <span className="address-value">{current.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="boarding-modal-actions">
          <button
            type="button"
            className="boarding-btn-confirm"
            onClick={handleConfirmSelection}
          >
            Select {current.name}
          </button>

          <button
            type="button"
            className="boarding-btn-close"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BoardingPointModal;
