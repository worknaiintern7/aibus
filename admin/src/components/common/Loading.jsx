import { Loader2 } from "lucide-react";

export const Loading = ({ text = "Loading data..." }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        color: "var(--admin-text-muted)",
        gap: "0.75rem",
      }}
    >
      <Loader2 className="animate-spin" size={32} style={{ animation: "spin 1s linear infinite", color: "var(--admin-primary)" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{text}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;
