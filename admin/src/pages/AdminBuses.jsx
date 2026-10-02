import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Grid, Eye, CheckCircle, XCircle, Radio, Bus as BusIcon, RefreshCw } from "lucide-react";
import { busService } from "../services/busService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";

export const AdminBuses = () => {
  const [activeTab, setActiveTab] = useState("live");

  // In-House DB Buses
  const [buses, setBuses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [inhouseLoading, setInhouseLoading] = useState(false);
  const [inhouseError, setInhouseError] = useState(null);

  // Live GDS API Buses
  const [liveBuses, setLiveBuses] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const fetchInhouseBuses = async () => {
    setInhouseLoading(true);
    setInhouseError(null);
    try {
      const response = await busService.getBuses(page, 20);
      if (response?.data) {
        setBuses(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setInhouseError(err.message || "Failed to load bus fleet.");
    } finally {
      setInhouseLoading(false);
    }
  };

  const fetchLiveGdsBuses = async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const response = await busService.getLiveGdsBuses();
      setLiveBuses(response?.data || []);
    } catch (err) {
      setLiveError(err.message || "Failed to load live GDS buses from API.");
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "live") {
      fetchLiveGdsBuses();
    } else {
      fetchInhouseBuses();
    }
  }, [activeTab, page]);

  const handleToggleStatus = async (bus) => {
    try {
      await busService.updateBusStatus(bus.id, !bus.active);
      fetchInhouseBuses();
    } catch (err) {
      alert(err.message || "Failed to toggle bus status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Bus Fleet Management"
        subtitle="Manage in-house fleet configurations and inspect live GDS bus operators"
        actions={
          <Link to="/buses/new" className="btn btn-primary">
            <Plus size={16} /> Add In-House Bus
          </Link>
        }
      />

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.5rem" }}>
        <button
          type="button"
          className={`btn ${activeTab === "live" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("live")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "8px" }}
        >
          <Radio size={16} /> Live GDS Bus Operators (External API)
          {liveBuses.length > 0 && activeTab === "live" && (
            <span style={{ background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {liveBuses.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "inhouse" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("inhouse")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "8px" }}
        >
          <BusIcon size={16} /> In-House Fleet (Local Database)
          {totalElements > 0 && activeTab === "inhouse" && (
            <span style={{ background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {totalElements}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE GDS BUSES */}
      {activeTab === "live" && (
        <div>
          {liveError && <ErrorState message={liveError} onRetry={fetchLiveGdsBuses} />}

          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>Active GDS Operator Buses</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", margin: "4px 0 0 0" }}>
                  Buses provided dynamically by live partner operators connected via Mantis GDS API.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={fetchLiveGdsBuses}
                disabled={liveLoading}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <RefreshCw size={13} className={liveLoading ? "spin-icon" : ""} /> Refresh Live Fleet
              </button>
            </div>

            {liveLoading ? (
              <Loading text="Fetching live bus operators from Mantis GDS API..." />
            ) : liveBuses.length === 0 ? (
              <EmptyState
                title="No Live Buses Found"
                description="Could not load live buses from Mantis GDS API right now."
              />
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>GDS Bus ID</th>
                      <th>Operator / Bus Name</th>
                      <th>Bus Number</th>
                      <th>Bus Type</th>
                      <th>Capacity</th>
                      <th>Route</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveBuses.map((b) => (
                      <tr key={b.gdsBusId || b.busNumber}>
                        <td>
                          <span style={{ fontWeight: "700", color: "#10b981" }}>
                            GDS-#{b.gdsBusId}
                          </span>
                        </td>
                        <td style={{ fontWeight: "600" }}>{b.operatorName}</td>
                        <td style={{ fontWeight: "600", color: "var(--admin-primary)" }}>{b.busNumber}</td>
                        <td>
                          <span className="badge badge-info">{b.busType}</span>
                        </td>
                        <td>{b.totalSeats} Seats</td>
                        <td>{b.source} → {b.destination}</td>
                        <td>
                          <span style={{ background: "#ecfdf5", color: "#059669", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                            Live on GDS API
                          </span>
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

      {/* TAB 2: IN-HOUSE FLEET */}
      {activeTab === "inhouse" && (
        <div>
          {inhouseError && <ErrorState message={inhouseError} onRetry={fetchInhouseBuses} />}

          <div className="admin-card">
            {inhouseLoading ? (
              <Loading text="Fetching in-house bus fleet..." />
            ) : buses.length === 0 ? (
              <EmptyState
                title="No In-House Buses Configured"
                description="Live customer searches are powered by partner operators in the 'Live GDS Bus Operators' tab. Click 'Add In-House Bus' if you wish to configure dedicated company buses."
                action={
                  <Link to="/buses/new" className="btn btn-primary">
                    <Plus size={16} /> Add In-House Bus
                  </Link>
                }
              />
            ) : (
              <>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Bus Number</th>
                        <th>Bus Name</th>
                        <th>Bus Type</th>
                        <th>Total Seats</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buses.map((b) => (
                        <tr key={b.id}>
                          <td style={{ fontWeight: "700", color: "var(--admin-primary)" }}>
                            {b.busNumber}
                          </td>
                          <td style={{ fontWeight: "600" }}>{b.busName}</td>
                          <td>
                            <span className="badge badge-info">{b.busType}</span>
                          </td>
                          <td>{b.totalSeats} seats</td>
                          <td>
                            <StatusBadge status={b.active ? "ACTIVE" : "INACTIVE"} />
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <Link to={`/buses/${b.id}`} className="btn btn-outline btn-sm">
                                <Eye size={14} /> View
                              </Link>
                              <Link to={`/buses/${b.id}/edit`} className="btn btn-outline btn-sm">
                                <Edit size={14} /> Edit
                              </Link>
                              <Link to={`/buses/${b.id}/seats`} className="btn btn-outline btn-sm">
                                <Grid size={14} /> Seats
                              </Link>
                              <Button
                                variant={b.active ? "danger" : "secondary"}
                                size="sm"
                                onClick={() => handleToggleStatus(b)}
                              >
                                {b.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                {b.active ? "Deactivate" : "Activate"}
                              </Button>
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
    </div>
  );
};

export default AdminBuses;
