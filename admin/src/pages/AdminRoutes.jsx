import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, CheckCircle, XCircle, MapPin } from "lucide-react";
import { routeService } from "../services/routeService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";

export const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await routeService.getRoutes(page, 20);
      if (response?.data) {
        setRoutes(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [page]);

  const handleToggleStatus = async (route) => {
    try {
      await routeService.updateRouteStatus(route.id, !route.active);
      fetchRoutes();
    } catch (err) {
      alert(err.message || "Failed to update route status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Route Management"
        subtitle="Manage origin and destination city routes"
        actions={
          <Link to="/routes/new" className="btn btn-primary">
            <Plus size={16} /> Create New Route
          </Link>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchRoutes} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Loading route directory..." />
        ) : routes.length === 0 ? (
          <EmptyState
            title="No Routes Configured"
            description="No travel routes exist yet. Click 'Create New Route' to add a route."
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
                      <td style={{ fontWeight: "600" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                          <MapPin size={14} style={{ color: "#10b981" }} />
                          {r.destination}
                        </span>
                      </td>
                      <td>
                        <StatusBadge active={r.active} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link to={`/routes/${r.id}/edit`} className="btn btn-outline btn-sm">
                            <Edit size={14} /> Edit
                          </Link>
                          <Button
                            variant={r.active ? "danger" : "outline"}
                            size="sm"
                            onClick={() => handleToggleStatus(r)}
                            icon={r.active ? XCircle : CheckCircle}
                          >
                            {r.active ? "Disable" : "Enable"}
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
  );
};

export default AdminRoutes;
