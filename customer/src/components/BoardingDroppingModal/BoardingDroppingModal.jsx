import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapPin, Navigation, Clock, Search, Check, ChevronRight, ArrowLeft } from "lucide-react";
import "./BoardingDroppingModal.css";

function BoardingDroppingModal({
  isOpen,
  onClose,
  sourceCity = "Departure City",
  destinationCity = "Arrival City",
  boardingPoints = [],
  droppingPoints = [],
  selectedPickupId = "",
  selectedDropoffId = "",
  initialTab = "boarding",
  onConfirm,
}) {
  const [activeTab, setActiveTab] = useState(initialTab || "boarding");
  const [pickupId, setPickupId] = useState(selectedPickupId || "");
  const [dropoffId, setDropoffId] = useState(selectedDropoffId || "");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setPickupId(selectedPickupId || "");
      setDropoffId(selectedDropoffId || "");
      // If boarding is already selected but dropping is not, open dropping tab
      if (selectedPickupId && !selectedDropoffId) {
        setActiveTab("dropping");
      } else {
        setActiveTab(initialTab || "boarding");
      }
      setSearchQuery("");
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, selectedPickupId, selectedDropoffId, initialTab]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Active points based on selected tab
  const currentPoints = activeTab === "boarding" ? boardingPoints : droppingPoints;
  const currentCity = activeTab === "boarding" ? sourceCity : destinationCity;

  // Filtered points by search query
  const filteredPoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentPoints;
    return currentPoints.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.landmark?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
    );
  }, [currentPoints, searchQuery]);

  if (!isOpen) return null;
  if (typeof document === "undefined" || !document.body) return null;

  const selectedPickup = (boardingPoints || []).find((p) => p && String(p.id) === String(pickupId));
  const selectedDropoff = (droppingPoints || []).find((p) => p && String(p.id) === String(dropoffId));

  const handleSelectPoint = (point) => {
    if (!point) return;
    const pointId = point.id != null ? String(point.id) : String(point.name || "");
    if (activeTab === "boarding") {
      setPickupId(pointId);
      // Smoothly advance to dropping point after a micro feedback delay
      setTimeout(() => {
        setActiveTab("dropping");
        setSearchQuery("");
      }, 180);
    } else {
      setDropoffId(pointId);
    }
  };

  const handleConfirm = () => {
    if (!pickupId) {
      setActiveTab("boarding");
      return;
    }
    if (!dropoffId) {
      setActiveTab("dropping");
      return;
    }
    onConfirm({ pickupId, dropoffId });
  };

  return createPortal(
    <div className="bdm-backdrop" onClick={onClose} role="presentation">
      <div
        className="bdm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bdm-title"
      >
        {/* Grab bar for mobile sheets */}
        <div className="bdm-grab-bar" />

        {/* Header */}
        <div className="bdm-header">
          <div className="bdm-title-block">
            <h2 id="bdm-title" className="bdm-headline">
              Select Boarding &amp; Dropping Points
            </h2>
            <p className="bdm-subheadline">
              {sourceCity} → {destinationCity}
            </p>
          </div>
          <button
            type="button"
            className="bdm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Stepper Bar */}
        <div className="bdm-stepper-bar">
          <button
            type="button"
            className={`bdm-step-tab ${activeTab === "boarding" ? "active" : ""} ${
              pickupId ? "completed" : ""
            }`}
            onClick={() => {
              setActiveTab("boarding");
              setSearchQuery("");
            }}
          >
            <div className="bdm-step-icon">
              {pickupId ? <Check size={14} className="check-icon" /> : <MapPin size={15} />}
            </div>
            <div className="bdm-step-content">
              <span className="bdm-step-num">Step 1</span>
              <strong className="bdm-step-name">Boarding Point</strong>
              <span className="bdm-step-city">
                {selectedPickup ? `${selectedPickup.name}` : sourceCity}
              </span>
            </div>
            {selectedPickup?.time && (
              <span className="bdm-step-time">{selectedPickup.time}</span>
            )}
          </button>

          <div className="bdm-step-connector">
            <ChevronRight size={18} className="connector-arrow" />
          </div>

          <button
            type="button"
            className={`bdm-step-tab ${activeTab === "dropping" ? "active" : ""} ${
              dropoffId ? "completed" : ""
            }`}
            onClick={() => {
              setActiveTab("dropping");
              setSearchQuery("");
            }}
          >
            <div className="bdm-step-icon">
              {dropoffId ? <Check size={14} className="check-icon" /> : <Navigation size={15} />}
            </div>
            <div className="bdm-step-content">
              <span className="bdm-step-num">Step 2</span>
              <strong className="bdm-step-name">Dropping Point</strong>
              <span className="bdm-step-city">
                {selectedDropoff ? `${selectedDropoff.name}` : destinationCity}
              </span>
            </div>
            {selectedDropoff?.time && (
              <span className="bdm-step-time">{selectedDropoff.time}</span>
            )}
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="bdm-search-wrapper">
          <Search size={16} className="bdm-search-icon" />
          <input
            type="text"
            className="bdm-search-input"
            value={searchQuery}
            placeholder={`Search ${activeTab === "boarding" ? "boarding" : "dropping"} points in ${currentCity}...`}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={false}
          />
          {searchQuery && (
            <button
              type="button"
              className="bdm-search-clear"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Points Content List */}
        <div className="bdm-list-container">
          {filteredPoints.length === 0 ? (
            <div className="bdm-empty-state">
              <MapPin size={32} className="bdm-empty-icon" />
              <p className="bdm-empty-text">
                No locations found in {currentCity} {searchQuery ? `matching "${searchQuery}"` : ""}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  className="bdm-empty-reset-btn"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="bdm-cards-list">
              {filteredPoints.map((point, idx) => {
                const isSelected =
                  activeTab === "boarding"
                    ? String(point.id) === String(pickupId)
                    : String(point.id) === String(dropoffId);

                return (
                  <div
                    key={point.id || point.name || `pt-${idx}`}
                    className={`bdm-point-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectPoint(point)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelectPoint(point);
                      }
                    }}
                  >
                    {/* Radio indicator */}
                    <div className="bdm-card-left">
                      <div className={`bdm-radio-ring ${isSelected ? "checked" : ""}`}>
                        {isSelected && <div className="bdm-radio-dot" />}
                      </div>
                    </div>

                    {/* Point details */}
                    <div className="bdm-card-center">
                      <div className="bdm-name-row">
                        <strong className="bdm-point-name">{point.name}</strong>
                        {point.time && (
                          <span className="bdm-time-badge">
                            <Clock size={12} className="time-icon" />
                            {point.time}
                          </span>
                        )}
                        {isSelected && (
                          <span className="bdm-selected-pill">
                            <Check size={11} /> Selected
                          </span>
                        )}
                      </div>

                      {point.landmark && (
                        <p className="bdm-point-landmark">
                          {point.landmark}
                        </p>
                      )}

                      {point.address && point.address !== point.name && (
                        <p className="bdm-point-address">{point.address}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Summary Bar */}
        <div className="bdm-footer">
          <div className="bdm-footer-summary">
            <div className="bdm-summary-item">
              <span className="summary-label">Boarding:</span>
              <strong className="summary-value">
                {selectedPickup ? (
                  <>
                    {selectedPickup.name}{" "}
                    <span className="summary-time">({selectedPickup.time || "--"})</span>
                  </>
                ) : (
                  <span className="summary-missing">Not chosen yet</span>
                )}
              </strong>
            </div>

            <div className="bdm-summary-item">
              <span className="summary-label">Dropping:</span>
              <strong className="summary-value">
                {selectedDropoff ? (
                  <>
                    {selectedDropoff.name}{" "}
                    <span className="summary-time">({selectedDropoff.time || "--"})</span>
                  </>
                ) : (
                  <span className="summary-missing">Not chosen yet</span>
                )}
              </strong>
            </div>
          </div>

          <div className="bdm-footer-actions">
            {activeTab === "dropping" && (
              <button
                type="button"
                className="bdm-back-btn"
                onClick={() => {
                  setActiveTab("boarding");
                  setSearchQuery("");
                }}
              >
                <ArrowLeft size={15} />
                <span>Back to Boarding</span>
              </button>
            )}

            {activeTab === "boarding" ? (
              <button
                type="button"
                className="bdm-continue-btn"
                disabled={!pickupId}
                onClick={() => {
                  setActiveTab("dropping");
                  setSearchQuery("");
                }}
              >
                <span>Next: Dropping Point</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="bdm-continue-btn confirm"
                disabled={!pickupId || !dropoffId}
                onClick={handleConfirm}
              >
                <span>Confirm &amp; Continue</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default BoardingDroppingModal;
