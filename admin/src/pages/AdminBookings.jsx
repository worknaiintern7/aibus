import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Ticket, Calendar, Phone, XCircle, Filter, Radio } from "lucide-react";
import { bookingService } from "../services/bookingService";
import PageHeader from "../components/layout/PageHeader";
import SearchInput from "../components/common/SearchInput";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { BOOKING_STATUSES } from "../utils/constants";

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState(""); // "" | "GDS" | "LOCAL"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    booking: null,
    loading: false,
  });

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookings(page, 20, search, statusFilter);
      if (response?.data) {
        let content = response.data.content || [];
        if (channelFilter) {
          content = content.filter((b) => b.provider === channelFilter);
        }
        setBookings(content);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, search, statusFilter, channelFilter]);

  const handleCancelClick = (bk) => {
    setCancelModal({
      isOpen: true,
      booking: bk,
      loading: false,
    });
  };

  const confirmCancelBooking = async () => {
    const { booking } = cancelModal;
    if (!booking) return;

    setCancelModal((prev) => ({ ...prev, loading: true }));
    try {
      await bookingService.cancelBooking(booking.bookingReference);
      setCancelModal({ isOpen: false, booking: null, loading: false });
      fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to cancel booking.");
      setCancelModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div>
      <PageHeader
        title="Booking Oversight"
        subtitle="Real-time oversight of all customer bookings created on the website (Mantis GDS & in-house)"
        actions={
          <>
            <SearchInput
              placeholder="Search by PNR, ref, or phone..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(0);
              }}
            />
            <select
              className="form-control"
              style={{ width: "160px", flexShrink: 0 }}
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Channels</option>
              <option value="GDS">Live GDS (Website)</option>
              <option value="LOCAL">In-House Fleet</option>
            </select>
            <select
              className="form-control"
              style={{ width: "150px", flexShrink: 0 }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              {BOOKING_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchBookings} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Fetching live booking records..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description={
              search || statusFilter || channelFilter
                ? "No booking matches your active search/filter criteria."
                : "No customer bookings have been placed yet. As users book on the customer website, confirmed bookings will appear here instantly."
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Booking Reference</th>
                    <th>Channel</th>
                    <th>Customer</th>
                    <th>Route & Bus</th>
                    <th>Date & Time</th>
                    <th>Seats</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id || b.bookingReference}>
                      <td>
                        <div style={{ fontWeight: "700", color: "var(--admin-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Ticket size={14} />
                          {b.bookingReference}
                        </div>
                        {b.pnrNo && (
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            PNR: <strong style={{ color: "inherit" }}>{b.pnrNo}</strong>
                          </div>
                        )}
                        {b.ticketNo && (
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            Tkt: {b.ticketNo}
                          </div>
                        )}
                      </td>
                      <td>
                        {b.provider === "GDS" ? (
                          <span style={{ background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                            <Radio size={11} /> Live GDS (Web)
                          </span>
                        ) : (
                          <span style={{ background: "#eff6ff", color: "#2563eb", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap" }}>
                            In-House
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{b.userName || "Customer"}</div>
                        {b.userMobile && (
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <Phone size={11} />
                            {b.userMobile}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{b.source} → {b.destination}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                          {b.busName} {b.busNumber ? `(${b.busNumber})` : ""}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} style={{ color: "var(--admin-text-muted)" }} />
                          {formatDate(b.journeyDate)}
                        </span>
                        {b.departureTime && (
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            Dep: {b.departureTime.toString().slice(0, 5)}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: "0.85rem" }}>
                          {b.selectedSeats || "--"}
                        </strong>
                      </td>
                      <td style={{ fontWeight: "700", color: "#10b981" }}>
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <Link
                            to={`/bookings/${b.bookingReference}`}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye size={14} /> Details
                          </Link>
                          {b.status === "CONFIRMED" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelClick(b)}
                              icon={XCircle}
                            >
                              Cancel
                            </Button>
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

      <ConfirmDialog
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmCancelBooking}
        title="Cancel Customer Booking"
        message={`Are you sure you want to cancel booking ${cancelModal.booking?.bookingReference}? This will release the seats with the operator and update the customer status.`}
        confirmText="Cancel Booking"
        confirmVariant="danger"
        loading={cancelModal.loading}
      />
    </div>
  );
};

export default AdminBookings;
