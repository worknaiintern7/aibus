import React, { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { authService } from "../services/authService";
import { User, Mail, ShieldCheck, Hash, LogOut, RefreshCw, KeyRound } from "lucide-react";
import Button from "../components/common/Button";

const AdminProfile = () => {
  const { admin, setAdmin, logout } = useAdminAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setMessage(null);
      const res = await authService.getProfile();
      const freshData = res.data?.data || res.data;
      if (freshData) {
        setAdmin(freshData);
        localStorage.setItem("admin_user", JSON.stringify(freshData));
        setMessage({ type: "success", text: "Profile refreshed successfully" });
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setMessage({ type: "error", text: "Failed to refresh profile" });
    } finally {
      setRefreshing(false);
    }
  };

  const initial = admin?.name
    ? admin.name.charAt(0).toUpperCase()
    : admin?.email
    ? admin.email.charAt(0).toUpperCase()
    : "A";

  return (
    <div className="admin-page">
      <PageHeader
        title="Admin Profile"
        subtitle="Manage your administrator account credentials and session details"
      />

      {message && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="profile-layout">
        {/* Left Side: Avatar & Identity Card */}
        <div className="admin-card profile-card">
          <div className="profile-avatar-circle">
            {initial}
          </div>
          <h2 className="profile-name">{admin?.name || "Administrator"}</h2>
          <p className="profile-email">{admin?.email || "admin@aibus.com"}</p>

          <div className="profile-badge-group">
            <span className="badge badge-primary">
              <ShieldCheck size={13} />
              {admin?.role || "ADMIN"}
            </span>
            <span className="badge badge-success">
              <span className="profile-status-dot"></span>
              Active Session
            </span>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-actions">
            <Button
              variant="outline"
              icon={RefreshCw}
              loading={refreshing}
              onClick={handleRefresh}
              className="w-100"
            >
              Refresh Account
            </Button>
            <Button
              variant="danger"
              icon={LogOut}
              onClick={logout}
              className="w-100"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Right Side: Account Details & Security Note */}
        <div className="admin-card profile-details-card">
          <div className="profile-section-header">
            <div className="profile-icon-pill">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="profile-section-title">Account Information</h3>
              <p className="profile-section-sub">Verified system credentials and authentication state</p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">Full Name</span>
              <div className="profile-info-val">
                <User size={18} className="profile-info-icon" />
                <span>{admin?.name || "System Admin"}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Email Address</span>
              <div className="profile-info-val">
                <Mail size={18} className="profile-info-icon" />
                <span>{admin?.email || "admin@aibus.com"}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Access Privilege</span>
              <div className="profile-info-val">
                <ShieldCheck size={18} className="profile-info-icon" />
                <span className="badge badge-primary">{admin?.role || "ADMIN"}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <span className="profile-info-label">Account ID</span>
              <div className="profile-info-val">
                <Hash size={18} className="profile-info-icon" />
                <code className="profile-code">#{admin?.id || 1}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
