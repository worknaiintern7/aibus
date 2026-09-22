import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Lock, Mail } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { authService } from "../services/authService";
import Button from "../components/common/Button";
import "../styles/admin.css";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email.trim(), password);
      if (response?.data?.token) {
        login(response.data);
        navigate("/dashboard");
      } else {
        setError("Invalid response received from server.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--admin-bg)",
        padding: "1.5rem",
      }}
    >
      <div
        className="admin-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.25rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--admin-primary-light)",
              color: "var(--admin-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem auto",
            }}
          >
            <Bus size={32} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--admin-text-main)" }}>
            AIBus Admin Portal
          </h2>
          <p style={{ fontSize: "0.875rem", color: "var(--admin-text-muted)", marginTop: "0.35rem" }}>
            Sign in with your administrator credentials
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              background: "var(--admin-danger-light)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#ef4444",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--admin-text-muted)",
                }}
              />
              <input
                type="email"
                className="form-control"
                placeholder="admin@aibus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "2.4rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--admin-text-muted)",
                }}
              />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "2.4rem" }}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            style={{ width: "100%", marginTop: "1rem", padding: "0.75rem" }}
          >
            Sign In to Dashboard
          </Button>
        </form>

        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.75rem", color: "var(--admin-text-subtle)" }}>
          Demo Admin: <strong>admin@aibus.com</strong> | <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
