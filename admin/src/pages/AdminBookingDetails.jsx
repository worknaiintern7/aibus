import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Ticket, User, Bus, MapPin, Calendar, Clock, IndianRupee, XCircle } from "lucide-react";
import { bookingService } from "../services/bookingService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatTime, formatDateTime } from "../utils/formatDate";

export const AdminBookingDetails = () => {
  const { reference } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getBookingByReference(reference);
      setBooking(res?.data || null);
    } catch (err) {
      setError(err.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [reference]);

  const handleCancelBooking = async () => {
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(reference);
      setCancelModal(false);
      fetchBookingDetails();
    } catch (err) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <Loading text="Fetching ticket reservation details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBookingDetails} />;

  return (
    <div>
      <PageHeader
        title={`PNR: ${booking?.bookingReference}`}
        subtitle={`Booked on ${formatDateTime(booking?.createdAt)}`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/bookings" className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Bookings
            </Link>
            {booking?.bookingStatus === "CONFIRMED" && (
              <Button variant="danger" onClick={() => setCancelModal(true)} icon={XCircle}>
                Cancel Ticket
              </Button>
            )}
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Reservation Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Ticket size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Booking PNR</div>
                <div style={{ fontWeight: "700", color: "var(--admin-primary)", fontSize: "1.1rem" }}>{booking?.bookingReference}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <User size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Customer</div>
                <div style={{ fontWeight: "600" }}>{booking?.user?.name} ({booking?.user?.mobile})</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Bus size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Bus Service</div>
                <div style={{ fontWeight: "600" }}>{booking?.busName} ({booking?.busNumber}) — {booking?.busType}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <MapPin size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Route</div>
                <div style={{ fontWeight: "600" }}>{booking?.source} → {booking?.destination}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Calendar size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Journey Date</div>
                <div style={{ fontWeight: "600" }}>
                  {formatDate(booking?.journeyDate)} ({formatTime(booking?.departureTime)} - {formatTime(booking?.arrivalTime)})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <IndianRupee size={18} style={{ color: "#10b981" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Total Paid Fare</div>
                <div style={{ fontWeight: "700", color: "#10b981", fontSize: "1.1rem" }}>
                  {formatCurrency(booking?.totalAmount)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", width: "18px" }}>●</div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Booking Status</div>
                <StatusBadge status={booking?.bookingStatus} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Passenger & Seat Assignments ({booking?.selectedSeats?.length || 0} seats)
          </h3>

          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginBottom: "0.35rem" }}>Reserved Seats:</div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {booking?.selectedSeats?.map((st, i) => (
                <span key={i} className="badge badge-info" style={{ fontSize: "0.85rem" }}>
                  Seat {st}
                </span>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginBottom: "0.5rem" }}>Passenger Manifest:</div>
          <div className="table-responsive">
            <table className="admin-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>Seat</th>
                  <th>Passenger Name</th>
                  <th>Age / Gender</th>
                </tr>
              </thead>
              <tbody>
                {booking?.passengers?.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: "700" }}>{p.seatNumber}</td>
                    <td style={{ fontWeight: "600" }}>{p.name}</td>
                    <td>{p.age} yrs / {p.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Ticket Reservation"
        message={`Are you sure you want to cancel booking ${booking?.bookingReference}? This action will release seats ${booking?.selectedSeats?.join(", ")}.`}
        confirmText="Cancel Reservation"
        confirmVariant="danger"
        loading={cancelLoading}
      />
    </div>
  );
};

export default AdminBookingDetails;
