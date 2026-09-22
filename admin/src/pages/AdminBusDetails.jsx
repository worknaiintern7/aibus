import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Grid, Bus, Hash, Users, Activity } from "lucide-react";
import { busService } from "../services/busService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";

export const AdminBusDetails = () => {
  const { id } = useParams();
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [busRes, seatsRes] = await Promise.all([
        busService.getBusById(id),
        busService.getBusSeats(id).catch(() => ({ data: [] })),
      ]);
      setBus(busRes?.data || null);
      setSeats(seatsRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load bus details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loading text="Loading vehicle information..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDetails} />;

  return (
    <div>
      <PageHeader
        title={`Bus Details — ${bus?.busNumber}`}
        subtitle={bus?.busName}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/buses" className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Fleet
            </Link>
            <Link to={`/buses/${id}/edit`} className="btn btn-outline">
              <Edit size={16} /> Edit Bus
            </Link>
            <Link to={`/buses/${id}/seats`} className="btn btn-primary">
              <Grid size={16} /> Configure Seats Layout
            </Link>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Vehicle Specifications
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Hash size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Bus Number</div>
                <div style={{ fontWeight: "700", color: "var(--admin-primary)", fontSize: "1.1rem" }}>{bus?.busNumber}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Bus size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Bus Name</div>
                <div style={{ fontWeight: "600" }}>{bus?.busName}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Users size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Bus Type & Capacity</div>
                <div style={{ fontWeight: "600" }}>{bus?.busType} ({bus?.totalSeats} total seats)</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Activity size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Operational Status</div>
                <StatusBadge active={bus?.active} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Configured Seats Layout ({seats.length} configured)
          </h3>

          {seats.length === 0 ? (
            <p style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>
              No seats configured yet. Click "Configure Seats Layout" to define row/column seat positions.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {seats.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "0.35rem 0.65rem",
                    borderRadius: "6px",
                    background: s.status === "AVAILABLE" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    border: `1px solid ${s.status === "AVAILABLE" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: s.status === "AVAILABLE" ? "#10b981" : "#ef4444",
                  }}
                >
                  {s.seatNumber} ({s.seatType})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBusDetails;
