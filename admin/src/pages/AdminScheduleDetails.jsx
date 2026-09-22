import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit, Calendar, Clock, MapPin, Bus, IndianRupee, XCircle } from "lucide-react";
import { scheduleService } from "../services/scheduleService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime } from "../utils/formatDate";

export const AdminScheduleDetails = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await scheduleService.getScheduleById(id);
      setSchedule(res?.data || null);
    } catch (err) {
      setError(err.message || "Failed to load schedule details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  const handleCancelSchedule = async () => {
    setCancelLoading(true);
    try {
      await scheduleService.updateScheduleStatus(id, "CANCELLED");
      setCancelModal(false);
      fetchSchedule();
    } catch (err) {
      alert(err.message || "Failed to cancel schedule.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <Loading text="Loading schedule details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSchedule} />;

  return (
    <div>
      <PageHeader
        title={`Schedule Details #${schedule?.id}`}
        subtitle={`${schedule?.source} → ${schedule?.destination}`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/schedules" className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Schedules
            </Link>
            {schedule?.status !== "CANCELLED" && (
              <>
                <Link to={`/schedules/${id}/edit`} className="btn btn-outline">
                  <Edit size={16} /> Edit Schedule
                </Link>
                <Button variant="danger" onClick={() => setCancelModal(true)} icon={XCircle}>
                  Cancel Trip
                </Button>
              </>
            )}
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Trip & Route Specifications
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Bus size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Bus Vehicle</div>
                <div style={{ fontWeight: "600" }}>{schedule?.busName} ({schedule?.busNumber})</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <MapPin size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Route</div>
                <div style={{ fontWeight: "600" }}>{schedule?.source} → {schedule?.destination}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Calendar size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Date & Timings</div>
                <div style={{ fontWeight: "600" }}>
                  {formatDate(schedule?.journeyDate)} ({formatTime(schedule?.departureTime)} - {formatTime(schedule?.arrivalTime)})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <IndianRupee size={18} style={{ color: "#10b981" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Base Ticket Fare</div>
                <div style={{ fontWeight: "700", color: "#10b981", fontSize: "1.1rem" }}>
                  {formatCurrency(schedule?.baseFare)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", width: "18px" }}>●</div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Current Status</div>
                <StatusBadge status={schedule?.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Boarding & Dropping Locations
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ padding: "1rem", borderRadius: "8px", background: "#0f172a", border: "1px solid var(--admin-card-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--admin-primary)", fontWeight: "600", marginBottom: "0.25rem" }}>
                BOARDING POINT
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{schedule?.boardingPoint}</div>
            </div>

            <div style={{ padding: "1rem", borderRadius: "8px", background: "#0f172a", border: "1px solid var(--admin-card-border)" }}>
              <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", marginBottom: "0.25rem" }}>
                DROPPING POINT
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{schedule?.droppingPoint}</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancelSchedule}
        title="Cancel Schedule"
        message="Are you sure you want to cancel this trip schedule? All future bookings on this trip will be cancelled."
        confirmText="Cancel Trip Schedule"
        confirmVariant="danger"
        loading={cancelLoading}
      />
    </div>
  );
};

export default AdminScheduleDetails;
