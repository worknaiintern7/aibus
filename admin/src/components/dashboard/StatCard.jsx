export const StatCard = ({ label, value, icon: Icon, color = "var(--admin-primary)" }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-lbl">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
