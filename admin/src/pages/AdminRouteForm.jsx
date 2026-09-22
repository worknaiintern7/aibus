import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { routeService } from "../services/routeService";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";

export const AdminRouteForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    active: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchRoute = async () => {
        try {
          const res = await routeService.getRouteById(id);
          if (res?.data) {
            setFormData({
              source: res.data.source,
              destination: res.data.destination,
              active: res.data.active,
            });
          }
        } catch (err) {
          setError(err.message || "Failed to load route data.");
        } finally {
          setLoading(false);
        }
      };
      fetchRoute();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.source || !formData.destination) {
      setError("Source and Destination cities are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await routeService.updateRoute(id, formData);
      } else {
        await routeService.createRoute(formData);
      }
      navigate("/routes");
    } catch (err) {
      setError(err.message || "Failed to save route.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading route information..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit Route #${id}` : "Create New Route"}
        subtitle={isEdit ? "Update source & destination cities" : "Configure a new travel route"}
        actions={
          <Link to="/routes" className="btn btn-outline">
            <ArrowLeft size={16} /> Back to Routes
          </Link>
        }
      />

      {error && <ErrorState message={error} />}

      <div className="admin-card" style={{ maxWidth: "600px", padding: "1.75rem" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Source City *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Chennai"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination City *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Coimbatore"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="checkbox"
              id="routeActiveCheck"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="routeActiveCheck" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
              Active and Operable Route
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              {isEdit ? "Update Route" : "Create Route"}
            </Button>
            <Link to="/routes" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRouteForm;
