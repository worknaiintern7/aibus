import { Inbox } from "lucide-react";

export const EmptyState = ({
  title = "No records found",
  description = "There are no entries to display at this time.",
  action,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
        color: "var(--admin-text-muted)",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          color: "var(--admin-text-subtle)",
        }}
      >
        <Inbox size={28} />
      </div>
      <h4 style={{ color: "var(--admin-text-main)", margin: "0 0 0.35rem 0", fontSize: "1.1rem" }}>
        {title}
      </h4>
      <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.875rem", maxWidth: "400px" }}>
        {description}
      </p>
      {action}
    </div>
  );
};

export default EmptyState;
