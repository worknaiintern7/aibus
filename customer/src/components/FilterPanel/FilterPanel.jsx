import { useState } from "react";
import "./FilterPanel.css";

function FilterPanel({ buses = [], filters = {}, onFilterChange }) {
  const [acOnly, setAcOnly] = useState(false);
  const [nonAcOnly, setNonAcOnly] = useState(false);
  const [sleeperOnly, setSleeperOnly] = useState(false);
  const [seaterOnly, setSeaterOnly] = useState(false);
  const [depTime, setDepTime] = useState([]);
  const [maxPrice, setMaxPrice] = useState(2000);

  // Dynamic filter count helper
  const countMatches = (typeKey, value) => {
    return buses.filter((bus) => {
      const isNonAc = bus.busType.toLowerCase().includes("non ac");
      const isAc = bus.busType.toLowerCase().includes("ac") && !isNonAc;
      const isSleeper = bus.busType.toLowerCase().includes("sleeper");
      const isSeater = bus.busType.toLowerCase().includes("seater");

      if (typeKey === "ac") return isAc;
      if (typeKey === "nonAc") return isNonAc;
      if (typeKey === "sleeper") return isSleeper;
      if (typeKey === "seater") return isSeater;

      if (typeKey === "depSlot") {
        const hour = parseInt(bus.departureTime.split(":")[0], 10);
        if (value === "before6am") return hour < 6;
        if (value === "6amTo12pm") return hour >= 6 && hour < 12;
        if (value === "12pmTo6pm") return hour >= 12 && hour < 18;
        if (value === "after6pm") return hour >= 18;
      }
      return true;
    }).length;
  };

  const handleClear = () => {
    setAcOnly(false);
    setNonAcOnly(false);
    setSleeperOnly(false);
    setSeaterOnly(false);
    setDepTime([]);
    setMaxPrice(2000);

    onFilterChange({
      acOnly: false,
      nonAcOnly: false,
      sleeperOnly: false,
      seaterOnly: false,
      depTime: [],
      maxPrice: 2000,
    });
  };

  const handleDepTimeToggle = (slot) => {
    const updated = depTime.includes(slot)
      ? depTime.filter((s) => s !== slot)
      : [...depTime, slot];

    setDepTime(updated);
    emitFilterChange({ depTime: updated });
  };

  const emitFilterChange = (overrides = {}) => {
    onFilterChange({
      acOnly: overrides.hasOwnProperty("acOnly") ? overrides.acOnly : acOnly,
      nonAcOnly: overrides.hasOwnProperty("nonAcOnly") ? overrides.nonAcOnly : nonAcOnly,
      sleeperOnly: overrides.hasOwnProperty("sleeperOnly") ? overrides.sleeperOnly : sleeperOnly,
      seaterOnly: overrides.hasOwnProperty("seaterOnly") ? overrides.seaterOnly : seaterOnly,
      depTime: overrides.hasOwnProperty("depTime") ? overrides.depTime : depTime,
      maxPrice: overrides.hasOwnProperty("maxPrice") ? overrides.maxPrice : maxPrice,
    });
  };

  return (
    <aside className="filter-panel">
      {/* Header */}
      <div className="filter-panel-header">
        <h2>Filters</h2>
        <button type="button" className="clear-all-btn" onClick={handleClear}>
          Clear All
        </button>
      </div>

      {/* Bus Type */}
      <div className="filter-section">
        <h3>Bus Type</h3>
        <label className={`checkbox-label ${acOnly ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={acOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setAcOnly(checked);
              emitFilterChange({ acOnly: checked });
            }}
          />
          <span>AC ({countMatches("ac")})</span>
        </label>

        <label className={`checkbox-label ${nonAcOnly ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={nonAcOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setNonAcOnly(checked);
              emitFilterChange({ nonAcOnly: checked });
            }}
          />
          <span>Non AC ({countMatches("nonAc")})</span>
        </label>
      </div>

      {/* Seat Type */}
      <div className="filter-section">
        <h3>Seat Type</h3>
        <label className={`checkbox-label ${sleeperOnly ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={sleeperOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setSleeperOnly(checked);
              emitFilterChange({ sleeperOnly: checked });
            }}
          />
          <span>Sleeper ({countMatches("sleeper")})</span>
        </label>

        <label className={`checkbox-label ${seaterOnly ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={seaterOnly}
            onChange={(e) => {
              const checked = e.target.checked;
              setSeaterOnly(checked);
              emitFilterChange({ seaterOnly: checked });
            }}
          />
          <span>Seater ({countMatches("seater")})</span>
        </label>
      </div>

      {/* Departure Time */}
      <div className="filter-section">
        <h3>Departure Time</h3>
        <label className={`checkbox-label ${depTime.includes("before6am") ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={depTime.includes("before6am")}
            onChange={() => handleDepTimeToggle("before6am")}
          />
          <span>Before 6 AM ({countMatches("depSlot", "before6am")})</span>
        </label>

        <label className={`checkbox-label ${depTime.includes("6amTo12pm") ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={depTime.includes("6amTo12pm")}
            onChange={() => handleDepTimeToggle("6amTo12pm")}
          />
          <span>6 AM – 12 PM ({countMatches("depSlot", "6amTo12pm")})</span>
        </label>

        <label className={`checkbox-label ${depTime.includes("12pmTo6pm") ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={depTime.includes("12pmTo6pm")}
            onChange={() => handleDepTimeToggle("12pmTo6pm")}
          />
          <span>12 PM – 6 PM ({countMatches("depSlot", "12pmTo6pm")})</span>
        </label>

        <label className={`checkbox-label ${depTime.includes("after6pm") ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={depTime.includes("after6pm")}
            onChange={() => handleDepTimeToggle("after6pm")}
          />
          <span>After 6 PM ({countMatches("depSlot", "after6pm")})</span>
        </label>
      </div>

      {/* Price Range Slider */}
      <div className="filter-section border-none">
        <h3>Price Range</h3>
        <div className="price-slider-wrapper">
          <input
            type="range"
            min="400"
            max="2000"
            step="50"
            value={maxPrice}
            onChange={(e) => {
              const val = Number(e.target.value);
              setMaxPrice(val);
              emitFilterChange({ maxPrice: val });
            }}
            className="red-range-input"
          />
          <div className="price-range-labels">
            <span>₹500</span>
            <span className="current-max-price">₹{maxPrice}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FilterPanel;