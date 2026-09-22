export const StatusBadge = ({ status, active }) => {
  let badgeClass = "badge-secondary";
  let label = status || (active ? "ACTIVE" : "INACTIVE");

  if (active === true || status === "ACTIVE" || status === "CONFIRMED" || status === "SUCCESS" || status === "COMPLETED") {
    badgeClass = "badge-success";
  } else if (active === false || status === "BLOCKED" || status === "FAILED" || status === "CANCELLED" || status === "DEACTIVATED") {
    badgeClass = "badge-danger";
  } else if (status === "SCHEDULED" || status === "INITIATED" || status === "PENDING") {
    badgeClass = "badge-warning";
  } else if (status === "REFUNDED" || status === "IN_PROGRESS") {
    badgeClass = "badge-info";
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

export default StatusBadge;
