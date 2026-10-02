import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, CheckCircle, XCircle, MapPin, Radio, ArrowRight, RefreshCw, Calendar } from "lucide-react";
import { routeService } from "../services/routeService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";

export const AdminRoutes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("live");

  // In-House DB Routes
  const [routes, setRoutes] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [inhouseLoading, setInhouseLoading] = useState(false);
  const [inhouseError, setInhouseError] = useState(null);

  // Live GDS Routes
  const [liveRoutes, setLiveRoutes] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const fetchInhouseRoutes = async () => {
    setInhouseLoading(true);
    setInhouseError(null);
    try {
      const response = await routeService.getRoutes(page, 20);
      if (response?.data) {
        setRoutes(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setInhouseError(err.message || "Failed to load routes.");
    } finally {
      setInhouseLoading(false);
    }
  };

  const fetchLiveGdsRoutes = async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const response = await routeService.getLiveGdsRoutes();
      setLiveRoutes(response?.data || []);
    } catch (err) {
      setLiveError(err.message || "Failed to load live GDS routes from API.");
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "live") {
      fetchLiveGdsRoutes();
    } else {
      fetchInhouseRoutes();
    }
  }, [activeTab, page]);

  const handleToggleStatus = async (route) => {
    try {
      await routeService.updateRouteStatus(route.id, !route.active);
      fetchInhouseRoutes();
    } catch (err) {
      alert(err.message || "Failed to update route status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Route Management"
        subtitle="Connected travel corridors on Mantis GDS API and custom in-house routes"
        actions={
          <Link to="/routes/new" className="btn btn-primary">
            <Plus size={16} /> Create New Route
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
          <Radio size={16} /> Live GDS Connected Routes (External API)
          {liveRoutes.length > 0 && activeTab === "live" && (
            <span style={{ background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {liveRoutes.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "inhouse" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveTab("inhouse")}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "8px" }}
        >
          <MapPin size={16} /> In-House Routes (Local Database)
          {totalElements > 0 && activeTab === "inhouse" && (
            <span style={{ background: "rgba(255,255,255,0.25)", padding: "1px 6px", borderRadius: "10px", fontSize: "0.75rem" }}>
              {totalElements}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE GDS CONNECTED ROUTES */}
      {activeTab === "live" && (
        <div>
          {liveError && <ErrorState message={liveError} onRetry={fetchLiveGdsRoutes} />}

          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "600", margin: 0 }}>Active GDS Route Network</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", margin: "4px 0 0 0" }}>
                  Live city corridors supported for real-time customer search and ticket booking through Mantis GDS API.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={fetchLiveGdsRoutes}
                disabled={liveLoading}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <RefreshCw size={13} className={liveLoading ? "spin-icon" : ""} /> Refresh Routes
              </button>
            </div>

            {liveLoading ? (
              <Loading text="Loading live route network from Mantis GDS API..." />
            ) : liveRoutes.length === 0 ? (
              <EmptyState
                title="No Live Routes Available"
                description="Could not load connected GDS routes right now."
              />
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Route Corridor</th>
                      <th>Origin City</th>
                      <th>Destination City</th>
                      <th>Frequency</th>
                      <th>Provider Engine</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveRoutes.map((r, idx) => (
                      <tr key={`${r.source}-${r.destination}-${idx}`}>
                        <td style={{ fontWeight: "700", color: "var(--admin-primary)" }}>
                          {r.source} <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle", margin: "0 4px" }} /> {r.destination}
                        </td>
                        <td style={{ fontWeight: "600" }}>{r.source}</td>
                        <td style={{ fontWeight: "600" }}>{r.destination}</td>
                        <td>Daily Departures</td>
                        <td>
                          <span style={{ background: "#ecfdf5", color: "#059669", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
                            Mantis GDS API
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success">ACTIVE LIVE</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate("/schedules")}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}
                          >
                            <Calendar size={13} /> View Live Schedules
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

      {/* TAB 2: IN-HOUSE ROUTES */}
      {activeTab === "inhouse" && (
        <div>
          {inhouseError && <ErrorState message={inhouseError} onRetry={fetchInhouseRoutes} />}

          <div className="admin-card">
            {inhouseLoading ? (
              <Loading text="Loading route directory..." />
            ) : routes.length === 0 ? (
              <EmptyState
                title="No In-House Routes Configured"
                description="All live customer bus booking searches run on the active Mantis GDS Route Network in the first tab. Click 'Create New Route' to add private in-house routes to the database."
                action={
                  <Link to="/routes/new" className="btn btn-primary">
                    <Plus size={16} /> Create New Route
                  </Link>
                }
              />
            ) : (
              <>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Route ID</th>
                        <th>Source City</th>
                        <th>Destination City</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((r) => (
                        <tr key={r.id}>
                          <td>#{r.id}</td>
                          <td style={{ fontWeight: "600" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                              <MapPin size={14} style={{ color: "var(--admin-primary)" }} />
                              {r.source}
                            </span>
                          </td>
                          <td style={{ fontWeight: "600" }}>{r.destination}</td>
                          <td>
                            <StatusBadge status={r.active ? "ACTIVE" : "INACTIVE"} />
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <Link to={`/routes/${r.id}/edit`} className="btn btn-outline btn-sm">
                                <Edit size={14} /> Edit
                              </Link>
                              <Button
                                variant={r.active ? "danger" : "secondary"}
                                size="sm"
                                onClick={() => handleToggleStatus(r)}
                              >
                                {r.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                {r.active ? "Deactivate" : "Activate"}
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

export default AdminRoutes;
