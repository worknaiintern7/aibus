import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Phone, Calendar, ShoppingBag, ShieldAlert, ShieldCheck } from "lucide-react";
import { userService } from "../services/userService";
import PageHeader from "../components/layout/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

export const AdminUserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUserById(id);
      setUser(response?.data || null);
    } catch (err) {
      setError(err.message || "Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setStatusLoading(true);
    try {
      await userService.updateUserStatus(user.id, !user.active);
      setConfirmDialog(false);
      fetchUserDetails();
    } catch (err) {
      alert(err.message || "Failed to update user status");
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <Loading text="Loading user profile details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchUserDetails} />;

  return (
    <div>
      <PageHeader
        title={`User Details — ${user?.name || "Customer"}`}
        subtitle={`Account ID #${user?.id}`}
        actions={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link to="/users" className="btn btn-outline">
              <ArrowLeft size={16} /> Back to Users
            </Link>
            {user?.active ? (
              <Button variant="danger" onClick={() => setConfirmDialog(true)} icon={ShieldAlert}>
                Block Account
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setConfirmDialog(true)} icon={ShieldCheck}>
                Unblock Account
              </Button>
            )}
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Customer Profile Info
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <User size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Full Name</div>
                <div style={{ fontWeight: "600" }}>{user?.name || "N/A"}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Phone size={18} style={{ color: "var(--admin-primary)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Mobile Number</div>
                <div style={{ fontWeight: "600" }}>{user?.mobile}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", width: "18px" }}>●</div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Account Status</div>
                <StatusBadge active={user?.active} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1.25rem", borderBottom: "1px solid var(--admin-card-border)", paddingBottom: "0.75rem" }}>
            Booking Summary Metrics
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <ShoppingBag size={18} style={{ color: "#10b981" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Total Completed/Confirmed Bookings</div>
                <div style={{ fontWeight: "700", fontSize: "1.2rem", color: "var(--admin-text-main)" }}>
                  {user?.totalBookings || 0}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <ShoppingBag size={18} style={{ color: "#38bdf8" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Total Lifetime Spent</div>
                <div style={{ fontWeight: "700", fontSize: "1.2rem", color: "#10b981" }}>
                  {formatCurrency(user?.totalBookingAmount)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <Calendar size={18} style={{ color: "var(--admin-warning)" }} />
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Last Booking Date</div>
                <div style={{ fontWeight: "600" }}>{formatDate(user?.lastBookingDate)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleToggleStatus}
        title={user?.active ? "Block User Account" : "Unblock User Account"}
        message={
          user?.active
            ? "Are you sure you want to block this user account? The user will be unable to sign in."
            : "Are you sure you want to unblock this user account?"
        }
        confirmText={user?.active ? "Block User" : "Unblock User"}
        confirmVariant={user?.active ? "danger" : "primary"}
        loading={statusLoading}
      />
    </div>
  );
};

export default AdminUserDetails;
