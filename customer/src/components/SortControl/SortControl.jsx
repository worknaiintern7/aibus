import "./SortControl.css";

function SortControl({ value, onChange }) {
  return (
    <div className="sort-control-wrapper">
      <span className="sort-label">Sort by:</span>
      <div className="sort-select-container">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sort-select"
        >
          <option value="departure_asc">Departure Time (Earliest)</option>
          <option value="price_asc">Price (Low to High)</option>
          <option value="price_desc">Price (High to Low)</option>
          <option value="duration_asc">Duration (Shortest)</option>
        </select>
        <svg
          className="sort-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

export default SortControl;
