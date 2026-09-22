import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { busService } from "../services/busService";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import { BUS_TYPES } from "../utils/constants";

export const AdminBusForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    busNumber: "",
    busName: "",
    busType: "AC_SLEEPER",
    totalSeats: 30,
    active: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchBus = async () => {
        try {
          const res = await busService.getBusById(id);
          if (res?.data) {
            setFormData({
              busNumber: res.data.busNumber,
              busName: res.data.busName,
              busType: res.data.busType,
              totalSeats: res.data.totalSeats,
              active: res.data.active,
            });
          }
        } catch (err) {
          setError(err.message || "Failed to fetch bus details.");
        } finally {
          setLoading(false);
        }
      };
      fetchBus();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.busNumber || !formData.busName) {
      setError("Bus Number and Bus Name are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit) {
        await busService.updateBus(id, formData);
      } else {
        await busService.createBus(formData);
      }
      navigate("/buses");
    } catch (err) {
      setError(err.message || "Failed to save bus details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading bus data..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit Bus — ${formData.busNumber}` : "Add New Bus"}
        subtitle={isEdit ? "Update vehicle specifications" : "Register a new vehicle in your fleet"}
        actions={
          <Link to="/buses" className="btn btn-outline">
            <ArrowLeft size={16} /> Back to Fleet
          </Link>
        }
      />

      {error && <ErrorState message={error} />}

      <div className="admin-card" style={{ maxWidth: "650px", padding: "1.75rem" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Bus Number (Registration Plate) *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. KA-01-AB-1234"
              value={formData.busNumber}
              onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bus Name / Service Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Royal Express Superfast"
              value={formData.busName}
              onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bus Type *</label>
            <select
              className="form-control"
              value={formData.busType}
              onChange={(e) => setFormData({ ...formData, busType: e.target.value })}
            >
              {BUS_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label} ({bt.value})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Total Passenger Seats *</label>
            <input
              type="number"
              min="1"
              max="100"
              className="form-control"
              value={formData.totalSeats}
              onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value, 10) || 0 })}
              required
            />
          </div>

          <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="checkbox"
              id="busActiveCheck"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label htmlFor="busActiveCheck" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
              Active and Operational
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              {isEdit ? "Update Bus Details" : "Create Bus"}
            </Button>
            <Link to="/buses" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBusForm;
