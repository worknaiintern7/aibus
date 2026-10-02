import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, XCircle, Calendar, Clock, MapPin, Radio, Search, RefreshCw, CheckCircle2 } from "lucide-react";
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
  // Tab: "live" or "inhouse"
  const [activeTab, setActiveTab] = useState("live");

  // In-House DB Schedules
  const [schedules, setSchedules] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [inhouseLoading, setInhouseLoading] = useState(false);
  const [inhouseError, setInhouseError] = useState(null);

  // Live GDS API Schedules
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [liveSource, setLiveSource] = useState("Bangalore");
  const [liveDestination, setLiveDestination] = useState("Chennai");
  const [liveDate, setLiveDate] = useState(defaultDateStr);
  const [liveSchedules, setLiveSchedules] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  // Points Modal (Boarding / Dropping points inspection)
  const [pointsModal, setPointsModal] = useState({
    isOpen: false,
    bus: null,
  });

  // Cancellation confirm modal
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    schedule: null,
    loading: false,
  });

  // Fetch In-House DB Schedules
  const fetchInhouseSchedules = async () => {
    setInhouseLoading(true);
    setInhouseError(null);
    try {
      const response = await scheduleService.getSchedules(page, 20, "", statusFilter);
      if (response?.data) {
        setSchedules(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setInhouseError(err.message || "Failed to load in-house schedules.");
    } finally {
      setInhouseLoading(false);
    }
  };

  // Fetch Live GDS Schedules from external API
  const fetchLiveGdsSchedules = async (src = liveSource, dest = liveDestination, d = liveDate) => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const response = await scheduleService.getLiveGdsSchedules(src, dest, d);
      const list = response?.data || [];
      setLiveSchedules(list);
    } catch (err) {
      setLiveError(err.message || "Failed to load live GDS schedules from API.");
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "live") {
      fetchLiveGdsSchedules();
    } else {
      fetchInhouseSchedules();
    }
  }, [activeTab, page, statusFilter]);

  const handleQuickRouteSelect = (src, dest) => {
    setLiveSource(src);
    setLiveDestination(dest);
    fetchLiveGdsSchedules(src, dest, liveDate);
  };

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
      fetchInhouseSchedules();
    } catch (err) {
      alert(err.message || "Failed to cancel schedule.");
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Schedule Management"
        subtitle="Monitor live trip schedules from Mantis GDS API and manage in-house fleet departures"
        actions={
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {activeTab === "inhouse" && (
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
            )}
            <Link to="/schedules/new" className="btn btn-primary">
              <Plus size={16} /> Create Schedule
            </Link>
          </div>
        }
      />

      {/* Segmented Tab Navigation */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.5rem" }}>
        <button
          type="button"
          className={`btn ${activeTab === "live" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("live")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "8px" }}
        >
          <Radio size={16} /> Live GDS Schedules (External API)
          {liveSchedules.length > 0 && activeTab === "live" && (
            <span style={{ background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {liveSchedules.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "inhouse" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("inhouse")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "8px" }}
        >
          <Calendar size={16} /> In-House Schedules (Database)
          {totalElements > 0 && activeTab === "inhouse" && (
            <span style={{ background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {totalElements}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE GDS SCHEDULES */}
      {activeTab === "live" && (
        <div>
          {/* Query & Filter Card */}
          <div className="admin-card" style={{ marginBottom: "1.25rem", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Radio size={16} color="#10b981" /> Live Mantis GDS Inventory Search
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", margin: "4px 0 0 0" }}>
                  Direct live stream from external bus operators connected to the AI Bus booking engine.
                </p>
              </div>

              {/* Quick Route Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", alignSelf: "center" }}>Quick Routes:</span>
                {[
                  ["Bangalore", "Chennai"],
                  ["Bangalore", "Hyderabad"],
                  ["Pune", "Mumbai"],
                  ["Mumbai", "Goa"],
                  ["Delhi", "Jaipur"],
                ].map(([src, dest]) => (
                  <button
                    key={`${src}-${dest}`}
                    type="button"
                    onClick={() => handleQuickRouteSelect(src, dest)}
                    style={{
                      fontSize: "0.75rem",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-border)",
                      background: liveSource === src && liveDestination === dest ? "var(--admin-primary)" : "var(--admin-bg)",
                      color: liveSource === src && liveDestination === dest ? "#fff" : "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {src} → {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Filter Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchLiveGdsSchedules();
              }}
              className="schedules-search-form"
            >
              <div className="schedules-input-group">
                <label className="schedules-input-label">Source City</label>
                <input
                  type="text"
                  className="form-control"
                  value={liveSource}
                  onChange={(e) => setLiveSource(e.target.value)}
                  placeholder="e.g. Bangalore"
                  required
                />
              </div>

              <div className="schedules-input-group">
                <label className="schedules-input-label">Destination City</label>
                <input
                  type="text"
                  className="form-control"
                  value={liveDestination}
                  onChange={(e) => setLiveDestination(e.target.value)}
                  placeholder="e.g. Chennai"
                  required
                />
              </div>

              <div className="schedules-input-group">
                <label className="schedules-input-label">Journey Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  required
                />
              </div>

              <div className="schedules-btn-group">
                <button
                  type="submit"
                  className="btn btn-primary schedules-fetch-btn"
                  disabled={liveLoading}
                >
                  {liveLoading ? <RefreshCw size={14} className="spin-icon" /> : <Search size={14} />} Fetch
                </button>
              </div>
            </form>
          </div>

          {liveError && <ErrorState message={liveError} onRetry={() => fetchLiveGdsSchedules()} />}

          <div className="admin-card">
            {liveLoading ? (
              <Loading text="Fetching live bus inventory from Mantis GDS API..." />
            ) : liveSchedules.length === 0 ? (
              <EmptyState
                title="No Live Buses Found for this Route/Date"
                description={`No active schedules returned by Mantis GDS for ${liveSource} → ${liveDestination} on ${liveDate}. Try another route or upcoming date.`}
                action={
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleQuickRouteSelect("Bangalore", "Chennai")}
                  >
                    Load Bangalore → Chennai
                  </button>
                }
              />
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Trip / GDS ID</th>
                      <th>Operator / Bus</th>
                      <th>Route</th>
                      <th>Departure → Arrival</th>
                      <th>Fare</th>
                      <th>Available Seats</th>
                      <th>Channel</th>
                      <th>Stops & Layout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveSchedules.map((bus) => (
                      <tr key={bus.gdsBusId || bus.scheduleId || bus.busNumber}>
                        <td>
                          <span style={{ fontWeight: "700", color: "#10b981", fontSize: "0.85rem" }}>
                            GDS-#{bus.gdsBusId || bus.busId || 1}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: "600" }}>{bus.busName || "GDS Operator"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            Bus #{bus.busNumber} • <span className="badge badge-info">{bus.busType}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: "600" }}>{bus.source} → {bus.destination}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>{formatDate(bus.journeyDate)}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                            {bus.departureTime ? bus.departureTime.toString().slice(0, 5) : "--"} → {bus.arrivalTime ? bus.arrivalTime.toString().slice(0, 5) : "--"}
                          </div>
                        </td>
                        <td style={{ fontWeight: "700", color: "#10b981", fontSize: "1rem" }}>
                          {formatCurrency(bus.fare)}
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: bus.availableSeats > 5 ? "#10b981" : "#f59e0b", fontWeight: "600" }}>
                            <CheckCircle2 size={14} /> {bus.availableSeats} Seats
                          </span>
                        </td>
                        <td>
                          <span style={{ background: "#ecfdf5", color: "#059669", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                            Live GDS API
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setPointsModal({ isOpen: true, bus })}
                          >
                            <Eye size={13} /> View Points ({bus.boardingPoints?.length || 0})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IN-HOUSE DB SCHEDULES */}
      {activeTab === "inhouse" && (
        <div>
          {inhouseError && <ErrorState message={inhouseError} onRetry={fetchInhouseSchedules} />}

          <div className="admin-card">
            {inhouseLoading ? (
              <Loading text="Fetching scheduled trips..." />
            ) : schedules.length === 0 ? (
              <EmptyState
                title="No In-House Schedules Configured"
                description="Currently all live website search results are served directly via Mantis GDS API. Click '+ Create Schedule' below if you want to add private fleet schedules to the database."
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
        </div>
      )}

      {/* Modal: View Boarding & Dropping Points of GDS Schedule */}
      {pointsModal.isOpen && pointsModal.bus && (
        <div className="admin-modal-overlay" onClick={() => setPointsModal({ isOpen: false, bus: null })}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
                {pointsModal.bus.busName} — Stops & Boarding Points
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setPointsModal({ isOpen: false, bus: null })}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: "70vh", overflowY: "auto", padding: "1.25rem" }}>
              <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--admin-bg)", borderRadius: "8px" }}>
                <div><strong>Route:</strong> {pointsModal.bus.source} → {pointsModal.bus.destination}</div>
                <div><strong>Bus Type:</strong> {pointsModal.bus.busType} | <strong>Fare:</strong> {formatCurrency(pointsModal.bus.fare)}</div>
                <div><strong>Available Seats:</strong> {pointsModal.bus.availableSeats} Seats</div>
              </div>

              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>Boarding Points:</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {(pointsModal.bus.boardingPoints || []).map((bp, idx) => (
                  <div key={bp.id || idx} style={{ border: "1px solid var(--admin-border)", padding: "8px 12px", borderRadius: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
                      <span>{bp.name}</span>
                      <span style={{ color: "var(--admin-primary)" }}>{bp.time}</span>
                    </div>
                    {bp.address && (
                      <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: "2px" }}>
                        <MapPin size={11} style={{ marginRight: "3px" }} />
                        {bp.address}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {pointsModal.bus.droppingPoint && (
                <>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>Dropping Point:</h4>
                  <div style={{ border: "1px solid var(--admin-border)", padding: "8px 12px", borderRadius: "6px" }}>
                    <strong>{pointsModal.bus.droppingPoint}</strong>
                  </div>
                </>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPointsModal({ isOpen: false, bus: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Cancel In-House Schedule */}
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
