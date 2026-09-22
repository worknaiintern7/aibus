import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, ShieldAlert, ShieldCheck } from "lucide-react";
import { userService } from "../services/userService";
import PageHeader from "../components/layout/PageHeader";
import SearchInput from "../components/common/SearchInput";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Button from "../components/common/Button";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Block/Unblock dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    user: null,
    targetActive: false,
    loading: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers(page, 20, search);
      if (response?.data) {
        setUsers(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleStatusToggle = (user) => {
    setConfirmDialog({
      isOpen: true,
      user,
      targetActive: !user.active,
      loading: false,
    });
  };

  const confirmStatusChange = async () => {
    const { user, targetActive } = confirmDialog;
    if (!user) return;

    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await userService.updateUserStatus(user.id, targetActive);
      setConfirmDialog({ isOpen: false, user: null, targetActive: false, loading: false });
      fetchUsers();
    } catch (err) {
      alert(err.message || "Failed to update user status");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage customer accounts, search users, and block/unblock access"
        actions={
          <SearchInput
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
          />
        }
      />

      {error && <ErrorState message={error} onRetry={fetchUsers} />}

      <div className="admin-card">
        {loading ? (
          <Loading text="Loading user directory..." />
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description={search ? `No user matching "${search}"` : "No registered user records exist yet."}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Total Bookings</th>
                    <th>Total Spent</th>
                    <th>Last Booking</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td style={{ fontWeight: "600" }}>{u.name || "N/A"}</td>
                      <td>{u.mobile}</td>
                      <td>
                        <StatusBadge active={u.active} />
                      </td>
                      <td>{u.totalBookings || 0}</td>
                      <td>{formatCurrency(u.totalBookingAmount)}</td>
                      <td>{formatDate(u.lastBookingDate)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Link to={`/users/${u.id}`} className="btn btn-outline btn-sm">
                            <Eye size={14} /> View
                          </Link>
                          {u.active ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleStatusToggle(u)}
                              icon={ShieldAlert}
                            >
                              Block
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStatusToggle(u)}
                              icon={ShieldCheck}
                            >
                              Unblock
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
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmStatusChange}
        title={confirmDialog.targetActive ? "Unblock User" : "Block User"}
        message={
          confirmDialog.targetActive
            ? `Are you sure you want to unblock ${confirmDialog.user?.name || "this user"}?`
            : `Are you sure you want to block ${confirmDialog.user?.name || "this user"}? They will not be able to log in.`
        }
        confirmText={confirmDialog.targetActive ? "Unblock User" : "Block User"}
        confirmVariant={confirmDialog.targetActive ? "primary" : "danger"}
        loading={confirmDialog.loading}
      />
    </div>
  );
};

export default AdminUsers;
