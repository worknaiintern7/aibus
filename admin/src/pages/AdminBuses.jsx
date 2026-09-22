import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Grid, Eye, CheckCircle, XCircle } from "lucide-react";
import { busService } from "../services/busService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";

export const AdminBuses = () => {
  const [buses, setBuses] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await busService.getBuses(page, 20);
      if (response?.data) {
        setBuses(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load bus fleet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [page]);

  const handleToggleStatus = async (bus) => {
    try {
      await busService.updateBusStatus(bus.id, !bus.active);
      fetchBuses();
    } catch (err) {
      alert(err.message || "Failed to toggle bus status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Bus Fleet Management"
        subtitle="Manage buses, total seat capacities, types, and active status"
        actions={
          <Link to="/buses/new" className="btn btn-primary">
            <Plus size={16} /> Add New Bus
          </Link>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchBuses} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Fetching bus fleet..." />
        ) : buses.length === 0 ? (
          <EmptyState
            title="No Buses Configured"
            description="No bus fleet records exist. Click 'Add New Bus' to configure your first bus."
            action={
              <Link to="/buses/new" className="btn btn-primary">
                <Plus size={16} /> Add New Bus
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
                        <StatusBadge active={b.active} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <Link to={`/buses/${b.id}`} className="btn btn-outline btn-sm">
                            <Eye size={14} /> View
                          </Link>
                          <Link to={`/buses/${b.id}/edit`} className="btn btn-outline btn-sm">
                            <Edit size={14} /> Edit
                          </Link>
                          <Link to={`/buses/${b.id}/seats`} className="btn btn-primary btn-sm">
                            <Grid size={14} /> Seats
                          </Link>
                          <Button
                            variant={b.active ? "danger" : "outline"}
                            size="sm"
                            onClick={() => handleToggleStatus(b)}
                            icon={b.active ? XCircle : CheckCircle}
                          >
                            {b.active ? "Disable" : "Enable"}
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

export default AdminBuses;
