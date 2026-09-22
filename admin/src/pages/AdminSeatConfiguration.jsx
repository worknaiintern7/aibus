import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Grid, Trash2 } from "lucide-react";
import { busService } from "../services/busService";
import PageHeader from "../components/layout/PageHeader";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { SEAT_TYPES } from "../utils/constants";

export const AdminSeatConfiguration = () => {
  const { id: busId } = useParams();
  const [bus, setBus] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Seat Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [seatForm, setSeatForm] = useState({
    seatNumber: "",
    seatType: "LOWER",
    rowNumber: 1,
    columnNumber: 1,
    active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [busRes, seatsRes] = await Promise.all([
        busService.getBusById(busId),
        busService.getBusSeats(busId).catch(() => ({ data: [] })),
      ]);
      setBus(busRes?.data || null);
      setSeats(seatsRes?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load seat layout configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [busId]);

  const handleOpenAddModal = () => {
    const nextRow = Math.max(...seats.map((s) => s.rowNumber || 1), 0) + 1;
    setSeatForm({
      seatNumber: `${nextRow}A`,
      seatType: "LOWER",
      rowNumber: nextRow > 0 ? nextRow : 1,
      columnNumber: 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleAddSeat = async (e) => {
    e.preventDefault();
    if (!seatForm.seatNumber) return;

    setModalSaving(true);
    try {
      await busService.createBusSeat(busId, seatForm);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to add seat.");
    } finally {
      setModalSaving(false);
    }
  };

  if (loading) return <Loading text="Loading seat configuration map..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div>
      <PageHeader
        title={`Seat Layout — ${bus?.busNumber}`}
        subtitle={`${bus?.busName} (${seats.length} / ${bus?.totalSeats} seats configured)`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to={`/buses/${busId}`} className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Bus Details
            </Link>
            <Button variant="primary" onClick={handleOpenAddModal} icon={Plus}>
              Add Seat
            </Button>
          </div>
        }
      />

      <div className="seat-grid-editor">
        <div className="seat-deck-container">
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            Interactive Seat Map Grid
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", marginBottom: "1.25rem" }}>
            Green = Active / Available seat, Red = Disabled / Blocked seat.
          </p>

          {seats.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--admin-text-muted)" }}>
              No seats added yet. Click <strong>"Add Seat"</strong> above to configure seats.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {seats.map((s, idx) => {
                const isActive = s.status === "AVAILABLE";
                return (
                  <div
                    key={idx}
                    className={`seat-item ${isActive ? "active" : "inactive"}`}
                    title={`Row ${s.rowNumber}, Col ${s.columnNumber} - ${s.seatType}`}
                  >
                    <span>{s.seatNumber}</span>
                    <span style={{ fontSize: "0.6rem", opacity: 0.8 }}>{s.seatType}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Seat Number</th>
                  <th>Seat Type</th>
                  <th>Row</th>
                  <th>Column</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {seats.map((s, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{s.seatNumber}</td>
                    <td>{s.seatType}</td>
                    <td>Row {s.rowNumber}</td>
                    <td>Col {s.columnNumber}</td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === "AVAILABLE" ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Bus Seat"
      >
        <form onSubmit={handleAddSeat}>
          <div className="form-group">
            <label className="form-label">Seat Identifier (e.g., 1A, 1B, L1) *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 1A"
              value={seatForm.seatNumber}
              onChange={(e) => setSeatForm({ ...seatForm, seatNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Seat Type *</label>
            <select
              className="form-control"
              value={seatForm.seatType}
              onChange={(e) => setSeatForm({ ...seatForm, seatType: e.target.value })}
            >
              {SEAT_TYPES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label} ({st.value})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Row Number *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={seatForm.rowNumber}
                onChange={(e) => setSeatForm({ ...seatForm, rowNumber: parseInt(e.target.value, 10) || 1 })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Column Number *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={seatForm.columnNumber}
                onChange={(e) => setSeatForm({ ...seatForm, columnNumber: parseInt(e.target.value, 10) || 1 })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: "none", padding: 0, marginTop: "1.5rem" }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={modalSaving}>
              Save Seat
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSeatConfiguration;
