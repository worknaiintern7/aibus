import "./JourneyPoints.css";

function PointSelect({ id, label, points, value, onChange, emptyText }) {
  const selected = points.find((p) => p.id === value);

  return (
    <div className="journey-point-field">
      <label htmlFor={id}>{label}</label>
      <div className="journey-select-wrap">
        <select id={id} value={value || ""} onChange={(e) => onChange(e.target.value)}>
          {points.length === 0 && <option value="">{emptyText}</option>}
          {points.map((p) => (
            <option key={p.id} value={p.id}>
              {p.time ? `${p.time} · ${p.name}` : p.name}
            </option>
          ))}
        </select>
        <span className="journey-select-caret" aria-hidden="true">
          ▾
        </span>
      </div>
      {selected?.landmark && <span className="journey-point-hint">{selected.landmark}</span>}
    </div>
  );
}

// Boarding and dropping point pickers for live buses (the operator needs both to hold seats)
function JourneyPoints({
  boardingPoints = [],
  droppingPoints = [],
  pickupId,
  dropoffId,
  onPickupChange,
  onDropoffChange,
}) {
  return (
    <div className="journey-points-card">
      <h3 className="journey-points-title">Boarding &amp; dropping</h3>

      <PointSelect
        id="journey-pickup"
        label="Boarding point"
        points={boardingPoints}
        value={pickupId}
        onChange={onPickupChange}
        emptyText="No boarding points"
      />

      <PointSelect
        id="journey-dropoff"
        label="Dropping point"
        points={droppingPoints}
        value={dropoffId}
        onChange={onDropoffChange}
        emptyText="No dropping points"
      />
    </div>
  );
}

export default JourneyPoints;
