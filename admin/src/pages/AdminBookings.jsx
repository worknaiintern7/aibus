import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Ticket, Calendar, Phone, XCircle } from "lucide-react";
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
        setBookings(response.data.content || []);
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
  }, [page, search, statusFilter]);

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
        subtitle="Search & inspect customer tickets, seats, amounts, and statuses"
        actions={
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <SearchInput
              placeholder="Search by PNR or mobile..."
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(0);
              }}
            />
            <select
              className="form-control"
              style={{ width: "160px" }}
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
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchBookings} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Fetching booking records..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description={
              search || statusFilter
                ? "No booking matches your active search/filter criteria."
                : "No customer bookings have been created yet."
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PNR Reference</th>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>Route</th>
                    <th>Journey Date</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id || b.bookingReference}>
                      <td style={{ fontWeight: "700", color: "var(--admin-primary)" }}>
                        <Ticket size={14} style={{ marginRight: "4px" }} />
                        {b.bookingReference}
                      </td>
                      <td style={{ fontWeight: "600" }}>{b.userName || "Customer"}</td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                          <Phone size={12} style={{ marginRight: "4px" }} />
                          {b.userMobile}
                        </span>
                      </td>
                      <td>{b.source} → {b.destination}</td>
                      <td>
                        <span style={{ fontSize: "0.85rem" }}>
                          <Calendar size={12} style={{ marginRight: "4px" }} />
                          {formatDate(b.journeyDate)}
                        </span>
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
        message={`Are you sure you want to cancel booking ${cancelModal.booking?.bookingReference}? Reserved seats will be released back to inventory.`}
        confirmText="Cancel Booking"
        confirmVariant="danger"
        loading={cancelModal.loading}
      />
    </div>
  );
};

export default AdminBookings;
