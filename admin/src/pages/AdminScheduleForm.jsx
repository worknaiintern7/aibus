import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { scheduleService } from "../services/scheduleService";
import { busService } from "../services/busService";
import { routeService } from "../services/routeService";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/common/Button";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import { SCHEDULE_STATUSES } from "../utils/constants";

export const AdminScheduleForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [formData, setFormData] = useState({
    busId: "",
    routeId: "",
    journeyDate: new Date().toISOString().split("T")[0],
    departureTime: "08:00:00",
    arrivalTime: "16:00:00",
    boardingPoint: "Central Bus Station",
    droppingPoint: "Main Bus Stand",
    baseFare: 500,
    status: "SCHEDULED",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        const [busRes, routeRes] = await Promise.all([
          busService.getBuses(0, 100),
          routeService.getRoutes(0, 100),
        ]);
        const availableBuses = busRes?.data?.content || [];
        const availableRoutes = routeRes?.data?.content || [];

        setBuses(availableBuses);
        setRoutes(availableRoutes);

        if (!isEdit && availableBuses.length > 0 && availableRoutes.length > 0) {
          setFormData((prev) => ({
            ...prev,
            busId: availableBuses[0].id,
            routeId: availableRoutes[0].id,
          }));
        }

        if (isEdit) {
          const schedRes = await scheduleService.getScheduleById(id);
          if (schedRes?.data) {
            setFormData({
              busId: schedRes.data.busId,
              routeId: schedRes.data.routeId,
              journeyDate: schedRes.data.journeyDate,
              departureTime: schedRes.data.departureTime,
              arrivalTime: schedRes.data.arrivalTime,
              boardingPoint: schedRes.data.boardingPoint,
              droppingPoint: schedRes.data.droppingPoint,
              baseFare: schedRes.data.baseFare,
              status: schedRes.data.status,
            });
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load form dropdown data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.busId || !formData.routeId || !formData.journeyDate) {
      setError("Please fill in all required schedule fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        busId: Number(formData.busId),
        routeId: Number(formData.routeId),
        baseFare: Number(formData.baseFare),
      };

      if (isEdit) {
        await scheduleService.updateSchedule(id, payload);
      } else {
        await scheduleService.createSchedule(payload);
      }
      navigate("/schedules");
    } catch (err) {
      setError(err.message || "Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading schedule form data..." />;

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit Schedule #${id}` : "Create Bus Schedule"}
        subtitle={isEdit ? "Update trip timing and fare" : "Schedule a new trip on an existing route"}
        actions={
          <Link to="/schedules" className="btn btn-outline">
            <ArrowLeft size={16} /> Back to Schedules
          </Link>
        }
      />

      {error && <ErrorState message={error} />}

      <div className="admin-card" style={{ maxWidth: "720px", padding: "1.75rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Assigned Bus *</label>
              <select
                className="form-control"
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                required
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.busNumber} — {b.busName} ({b.busType})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Route *</label>
              <select
                className="form-control"
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                required
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.source} → {r.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Journey Date *</label>
              <input
                type="date"
                className="form-control"
                value={formData.journeyDate}
                onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Departure Time *</label>
              <input
                type="text"
                className="form-control"
                placeholder="HH:mm:ss"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Arrival Time *</label>
              <input
                type="text"
                className="form-control"
                placeholder="HH:mm:ss"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Boarding Point Location *</label>
              <input
                type="text"
                className="form-control"
                value={formData.boardingPoint}
                onChange={(e) => setFormData({ ...formData, boardingPoint: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dropping Point Location *</label>
              <input
                type="text"
                className="form-control"
                value={formData.droppingPoint}
                onChange={(e) => setFormData({ ...formData, droppingPoint: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Base Ticket Fare (₹) *</label>
              <input
                type="number"
                min="0"
                step="10"
                className="form-control"
                value={formData.baseFare}
                onChange={(e) => setFormData({ ...formData, baseFare: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trip Status *</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {SCHEDULE_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              {isEdit ? "Update Schedule" : "Create Schedule"}
            </Button>
            <Link to="/schedules" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminScheduleForm;
