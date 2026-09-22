import { AlertOctagon, RefreshCw } from "lucide-react";
import Button from "./Button";

export const ErrorState = ({
  message = "Failed to load data. Please try again.",
  onRetry,
}) => {
  return (
    <div
      style={{
        padding: "2rem",
        background: "var(--admin-danger-light)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        borderRadius: "var(--admin-border-radius)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", color: "#ef4444" }}>
        <AlertOctagon size={24} />
        <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{message}</span>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
