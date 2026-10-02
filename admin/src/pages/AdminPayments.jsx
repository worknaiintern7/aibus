import { useState, useEffect } from "react";
import { CreditCard, Calendar, Ticket, Phone, Radio } from "lucide-react";
import { paymentService } from "../services/paymentService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDateTime } from "../utils/formatDate";
import { PAYMENT_STATUSES } from "../utils/constants";

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPayments(page, 20, statusFilter);
      if (response?.data) {
        setPayments(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Payment Records"
        subtitle="End-to-end audit of all online customer transactions from website & GDS gateway"
        actions={
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
            {PAYMENT_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchPayments} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Fetching payment audit records..." />
        ) : payments.length === 0 ? (
          <EmptyState
            title="No Payments Found"
            description="No transaction logs match your active filters. As customers book on the website, payments will log here in real-time."
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table" style={{ minWidth: "860px" }}>
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Booking Reference</th>
                    <th>Channel</th>
                    <th>Customer / Mobile</th>
                    <th>Trip Corridor</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Transaction Time</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.paymentId || p.id}>
                      <td style={{ fontWeight: "700", color: "var(--admin-primary)", whiteSpace: "nowrap" }}>
                        <CreditCard size={14} style={{ marginRight: "4px" }} />
                        #{p.paymentId || p.id}
                      </td>
                      <td style={{ fontWeight: "600", whiteSpace: "nowrap" }}>
                        <Ticket size={14} style={{ marginRight: "4px", color: "var(--admin-text-muted)" }} />
                        {p.bookingReference || "N/A"}
                      </td>
                      <td>
                        <span style={{ background: p.channel?.includes("GDS") ? "#ecfdf5" : "#eff6ff", color: p.channel?.includes("GDS") ? "#059669" : "#2563eb", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600", whiteSpace: "nowrap", display: "inline-block" }}>
                          {p.channel || "ONLINE"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600" }}>{p.passengerName || "Customer"}</div>
                        {p.userMobile && (
                          <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                            <Phone size={11} style={{ marginRight: "2px" }} />
                            {p.userMobile}
                          </div>
                        )}
                      </td>
                      <td>
                        {p.source && p.destination ? (
                          <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                            {p.source} → {p.destination}
                          </div>
                        ) : (
                          <span style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem" }}>--</span>
                        )}
                      </td>
                      <td style={{ fontWeight: "700", color: "#10b981", fontSize: "1rem" }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                          <Calendar size={12} style={{ marginRight: "4px" }} />
                          {formatDateTime(p.createdAt)}
                        </span>
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

export default AdminPayments;
