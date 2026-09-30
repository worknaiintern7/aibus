import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import agentService from "../services/agentService";
import "./AgentPortal.css";

function AgentLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pendingNotice, setPendingNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setPendingNotice("");

    if (!identifier.trim()) {
      setError("Please enter your Agent Code, Mobile Number, or Application ID.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await agentService.agentLogin(identifier, password);
      if (res.success) {
        navigate("/dashboard");
      } else if (res.isPending) {
        setPendingNotice(res.message);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (agentCode, pwd) => {
    setIdentifier(agentCode);
    setPassword(pwd);
    setError("");
    setPendingNotice("");

    try {
      const res = await agentService.agentLogin(agentCode, pwd);
      if (res.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckEnquiry = async (enqId) => {
    setIdentifier(enqId);
    setPassword("agent123");
    setError("");
    setPendingNotice("");

    try {
      const res = await agentService.agentLogin(enqId, "agent123");
      if (res.isPending) {
        setPendingNotice(res.message);
      } else if (res.message) {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="agent-landing-page">
      <div className="agent-landing-container" style={{ maxWidth: "480px" }}>
        <div className="login-top-back">
          <Link to="/" className="btn-back-link">
            <ArrowLeft size={16} />
            <span>Back to Partner Network</span>
          </Link>
        </div>

        <div className="agent-login-card">
          <div className="login-badge-header">
            <div className="login-logo-box">
              <Briefcase size={22} className="login-gold-icon" />
            </div>
            <div>
              <h2 className="login-card-title">Agent Partner Sign In</h2>
              <span className="login-card-sub">Access Mantis GDS B2B Ticketing Desk</span>
            </div>
          </div>

          {error && (
            <div className="agent-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {pendingNotice && (
            <div className="agent-pending-banner">
              <AlertCircle size={18} />
              <div>
                <strong>Application Status: Under Review</strong>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px" }}>{pendingNotice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="agent-login-form">
            <div className="form-field">
              <label>Agent Code / Registered Mobile / Application ID</label>
              <input
                type="text"
                placeholder="e.g. AG-5091 or 9845012345"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label>Password</label>
                {import.meta.env.DEV && <span className="forgot-lbl">Default: agent123</span>}
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-agent-submit" disabled={submitting}>
              {submitting ? "Authenticating..." : "Login to B2B Booking Portal"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Login Helpers (development builds only) */}
          {import.meta.env.DEV && (
          <div className="quick-demo-helpers">
            <span className="helper-label">One-Click Quick Testing:</span>
            
            <button
              type="button"
              className="quick-agent-btn active"
              onClick={() => handleQuickLogin("AG-5091", "agent123")}
            >
              <CheckCircle2 size={14} className="text-green" />
              <div>
                <strong>Ramesh Travels (AG-5091)</strong>
                <span>Active Partner • Bengaluru • ₹19,978 Balance</span>
              </div>
            </button>

            <button
              type="button"
              className="quick-agent-btn pending"
              onClick={() => handleCheckEnquiry("ENQ-2026-7841")}
            >
              <AlertCircle size={14} className="text-amber" />
              <div>
                <strong>Check Enquiry #ENQ-2026-7841</strong>
                <span>Bharat Yatra Express • Under KYC Review</span>
              </div>
            </button>
          </div>
          )}

          <div className="login-card-footer">
            <span>New travel agency or booking counter?</span>
            <Link to="/register" className="register-now-link">
              Apply for Agent KYC ➔
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AgentLogin;
