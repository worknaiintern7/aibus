import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, XCircle, Calendar, Clock } from "lucide-react";
import { scheduleService } from "../services/scheduleService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime } from "../utils/formatDate";
import { SCHEDULE_STATUSES } from "../utils/constants";

export const AdminSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation confirm modal
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    schedule: null,
    loading: false,
  });

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scheduleService.getSchedules(page, 20, "", statusFilter);
      if (response?.data) {
        setSchedules(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load bus schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [page, statusFilter]);

  const handleCancelClick = (sched) => {
    setCancelModal({
      isOpen: true,
      schedule: sched,
      loading: false,
    });
  };

  const confirmCancelSchedule = async () => {
    const { schedule } = cancelModal;
    if (!schedule) return;

    setCancelModal((prev) => ({ ...prev, loading: true }));
    try {
      await scheduleService.updateScheduleStatus(schedule.id, "CANCELLED");
      setCancelModal({ isOpen: false, schedule: null, loading: false });
      fetchSchedules();
    } catch (err) {
      alert(err.message || "Failed to cancel schedule.");
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Schedule Management"
        subtitle="Manage bus trips, timings, fares, and journey dates"
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <select
              className="form-control"
              style={{ width: "160px" }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              {SCHEDULE_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            <Link to="/schedules/new" className="btn btn-primary">
              <Plus size={16} /> Create Schedule
            </Link>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchSchedules} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Fetching scheduled trips..." />
        ) : schedules.length === 0 ? (
          <EmptyState
            title="No Schedules Found"
            description="No trip schedules match your current filters."
            action={
              <Link to="/schedules/new" className="btn btn-primary">
                <Plus size={16} /> Create Schedule
              </Link>
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Bus</th>
                    <th>Route</th>
                    <th>Journey Date</th>
                    <th>Departure / Arrival</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{s.busName}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--admin-primary)" }}>{s.busNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{s.source} → {s.destination}</div>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar size={14} style={{ color: "var(--admin-text-muted)" }} />
                          {formatDate(s.journeyDate)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem" }}>
                          <Clock size={12} style={{ color: "var(--admin-text-muted)", marginRight: "4px" }} />
                          {formatTime(s.departureTime)} - {formatTime(s.arrivalTime)}
                        </div>
                      </td>
                      <td style={{ fontWeight: "700", color: "#10b981" }}>
                        {formatCurrency(s.baseFare)}
                      </td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <Link to={`/schedules/${s.id}`} className="btn btn-outline btn-sm">
                            <Eye size={14} /> View
                          </Link>
                          {s.status !== "CANCELLED" && (
                            <>
                              <Link to={`/schedules/${s.id}/edit`} className="btn btn-outline btn-sm">
                                <Edit size={14} /> Edit
                              </Link>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancelClick(s)}
                                icon={XCircle}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              pageNumber={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmCancelSchedule}
        title="Cancel Trip Schedule"
        message={`Are you sure you want to cancel Schedule #${cancelModal.schedule?.id} (${cancelModal.schedule?.source} → ${cancelModal.schedule?.destination})?`}
        confirmText="Cancel Schedule"
        confirmVariant="danger"
        loading={cancelModal.loading}
      />
    </div>
  );
};

export default AdminSchedules;
