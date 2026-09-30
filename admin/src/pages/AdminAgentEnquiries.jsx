import React, { useState, useEffect } from "react";
import {
  Clock,
  FileText,
  ShieldCheck,
  Search,
  Eye,
  UserCheck,
  X,
  Percent,
  Wallet
} from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import adminAgentService from "../services/agentService";
import "../styles/admin.css";

export const AdminAgentEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [approvedAgents, setApprovedAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | all
  const [search, setSearch] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Approval form state
  const [commissionPct, setCommissionPct] = useState(10);
  const [initialBalance, setInitialBalance] = useState(19978.55);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  // Reject state
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const refreshData = async () => {
    const [enqs, agents] = await Promise.all([
      adminAgentService.getEnquiries(),
      adminAgentService.getApprovedAgents(),
    ]);
    setEnquiries(enqs);
    setApprovedAgents(agents);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const pendingCount = enquiries.filter((e) => e.status === "PENDING").length;
  const approvedCount = approvedAgents.length;

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.agencyName?.toLowerCase().includes(search.toLowerCase()) ||
      e.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      e.mobile?.includes(search) ||
      e.city?.toLowerCase().includes(search.toLowerCase()) ||
      e.id?.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "pending") return matchesSearch && e.status === "PENDING";
    if (activeTab === "rejected") return matchesSearch && e.status === "REJECTED";
    if (activeTab === "all") return matchesSearch;
    return matchesSearch;
  });

  const handleOpenReview = (enq) => {
    setSelectedEnquiry(enq);
    setCommissionPct(10);
    setInitialBalance(19978.55);
    setRejectMode(false);
    setRejectReason("");
    setActionSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedEnquiry) return;
    try {
      const newAgent = await adminAgentService.approveEnquiry(selectedEnquiry.id, {
        commissionPct,
        initialBalance,
      });
      setActionSuccessMsg(`Agency approved successfully! Generated Agent Code: ${newAgent.agentCode}. Credentials sent to agent.`);
      await refreshData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1800);
    } catch (err) {
      alert("Error approving enquiry: " + err.message);
    }
  };

  const handleReject = async () => {
    if (!selectedEnquiry) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejecting the application.");
      return;
    }
    try {
      await adminAgentService.rejectEnquiry(selectedEnquiry.id, rejectReason);
      setActionSuccessMsg("Application has been marked as REJECTED with provided reason.");
      await refreshData();
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      alert("Error rejecting enquiry: " + err.message);
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Agent Onboarding & KYC Inquiries"
        description="Review, verify business documents, and approve B2B Travel Agency partnerships."
      />

      {/* 4 Summary Metric Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending KYC Reviews</span>
            <Clock size={20} style={{ color: "#d97706" }} />
          </div>
          <div className="stat-card-value" style={{ color: "#b45309" }}>{pendingCount}</div>
          <span className="stat-card-desc">Requires admin verification</span>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active Verified Agents</span>
            <UserCheck size={20} style={{ color: "#16a34a" }} />
          </div>
          <div className="stat-card-value">{approvedCount}</div>
          <span className="stat-card-desc">Operating on Mantis GDS network</span>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Mantis Live Pool</span>
            <Wallet size={20} style={{ color: "#ca8a04" }} />
          </div>
          <div className="stat-card-value">₹19,978.55</div>
          <span className="stat-card-desc">Available ClientId #50 balance</span>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Default Commission</span>
            <Percent size={20} style={{ color: "#2563eb" }} />
          </div>
          <div className="stat-card-value">10% - 12%</div>
          <span className="stat-card-desc">Standard Mantis B2B markup</span>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="admin-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
        <div className="admin-tabs" style={{ display: "flex", gap: "8px" }}>
          <button
            className={`admin-tab-btn ${activeTab === "pending" ? "active" : ""}`}
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: activeTab === "pending" ? "#0f172a" : "#ffffff",
              color: activeTab === "pending" ? "#ffffff" : "#475569",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Pending Inquiries ({pendingCount})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: activeTab === "approved" ? "#0f172a" : "#ffffff",
              color: activeTab === "approved" ? "#ffffff" : "#475569",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Approved Travel Partners ({approvedCount})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: activeTab === "all" ? "#0f172a" : "#ffffff",
              color: activeTab === "all" ? "#ffffff" : "#475569",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            All Applications
          </button>
        </div>

        <div style={{ position: "relative", minWidth: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search Agency, Name, Mobile, City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              paddingLeft: "36px",
              paddingRight: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              outline: "none",
              fontSize: "13.5px"
            }}
          />
        </div>
      </div>

      {/* Main Table */}
      {activeTab === "approved" ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Agent Code</th>
                <th>Agency Name</th>
                <th>Owner / Contact</th>
                <th>Location</th>
                <th>GSTIN / PAN</th>
                <th>Commission</th>
                <th>Wallet Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedAgents.map((ag) => (
                <tr key={ag.agentCode}>
                  <td><strong style={{ color: "#2563eb", fontFamily: "monospace" }}>{ag.agentCode}</strong></td>
                  <td>
                    <strong>{ag.agencyName}</strong>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>Approved on {ag.approvedAt}</div>
                  </td>
                  <td>
                    <div>{ag.ownerName}</div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>{ag.mobile}</div>
                  </td>
                  <td>{ag.city}, {ag.state}</td>
                  <td>
                    <div style={{ fontSize: "12px", fontFamily: "monospace" }}>{ag.gstin}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>PAN: {ag.pan}</div>
                  </td>
                  <td><strong style={{ color: "#d97706" }}>{ag.commissionPct}%</strong></td>
                  <td><strong style={{ color: "#16a34a" }}>₹{Number(ag.walletBalance).toLocaleString("en-IN")}</strong></td>
                  <td>
                    <span style={{ background: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontSize: "11.5px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={13} /> Active Partner
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Agency Details</th>
                <th>Owner & Contact</th>
                <th>Location</th>
                <th>Tax Info</th>
                <th>Attached KYC</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No agent inquiries found in this view.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td><strong style={{ fontFamily: "monospace", color: "#0f172a" }}>{enq.id}</strong></td>
                    <td>
                      <strong>{enq.agencyName}</strong>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>{enq.legalEntity} • Applied: {enq.appliedDate?.split(" ")[0]}</div>
                    </td>
                    <td>
                      <div>{enq.ownerName}</div>
                      <div style={{ fontSize: "12px", color: "#475569" }}>{enq.mobile}</div>
                      <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>{enq.email}</div>
                    </td>
                    <td>
                      <div>{enq.city}</div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>{enq.state}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", fontFamily: "monospace" }}>{enq.gstin}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>PAN: {enq.pan}</div>
                    </td>
                    <td>
                      <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "600" }}>
                        📎 {enq.documents?.length || 4} Documents
                      </span>
                    </td>
                    <td>
                      {enq.status === "PENDING" && (
                        <span style={{ background: "#fffbeb", color: "#b45309", padding: "4px 10px", borderRadius: "12px", fontSize: "11.5px", fontWeight: "700" }}>
                          Under Review
                        </span>
                      )}
                      {enq.status === "APPROVED" && (
                        <span style={{ background: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontSize: "11.5px", fontWeight: "700" }}>
                          Approved
                        </span>
                      )}
                      {enq.status === "REJECTED" && (
                        <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "4px 10px", borderRadius: "12px", fontSize: "11.5px", fontWeight: "700" }}>
                          Rejected
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenReview(enq)}
                        style={{
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px"
                        }}
                      >
                        <Eye size={13} /> Review KYC
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* KYC Review & Approval Modal */}
      {isModalOpen && selectedEnquiry && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "28px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            position: "relative"
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: "absolute", right: "20px", top: "20px", background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#ca8a04", letterSpacing: "0.5px" }}>
                KYC VERIFICATION DESK • {selectedEnquiry.id}
              </span>
              <h2 style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>
                {selectedEnquiry.agencyName}
              </h2>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Legal Type: {selectedEnquiry.legalEntity} • Applied: {selectedEnquiry.appliedDate}
              </span>
            </div>

            {actionSuccessMsg && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "13.5px", fontWeight: "600" }}>
                ✅ {actionSuccessMsg}
              </div>
            )}

            {/* Profile Overview Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "#f8fafc", padding: "16px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>OWNER / APPLICANT</span>
                <strong>{selectedEnquiry.ownerName}</strong>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>MOBILE & EMAIL</span>
                <div>{selectedEnquiry.mobile}</div>
                <div style={{ color: "#64748b", fontSize: "12px" }}>{selectedEnquiry.email}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>OFFICE ADDRESS</span>
                <div>{selectedEnquiry.address}</div>
                <div style={{ color: "#64748b" }}>{selectedEnquiry.city}, {selectedEnquiry.state} - {selectedEnquiry.pincode}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "700" }}>STATUTORY TAX CODES</span>
                <div>GSTIN: <strong>{selectedEnquiry.gstin}</strong></div>
                <div>PAN: <strong>{selectedEnquiry.pan}</strong></div>
              </div>
            </div>

            {/* Documents Verification Checklist */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                Submitted Business & KYC Documents
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(selectedEnquiry.documents || []).map((doc, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#ffffff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FileText size={18} style={{ color: "#2563eb" }} />
                      <div>
                        <strong style={{ fontSize: "13px", display: "block" }}>{doc.type}</strong>
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>{doc.name} ({doc.size})</span>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: "4px" }}>
                      ✓ Verified Format
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Approve or Reject */}
            {selectedEnquiry.status === "PENDING" && !rejectMode && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "800", color: "#92400e" }}>
                  Commission & Settlement Setup for Approval
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#78350f", display: "block", marginBottom: "4px" }}>
                      ASSIGNED COMMISSION SLAB (%)
                    </label>
                    <input
                      type="number"
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(e.target.value)}
                      style={{ width: "100%", height: "38px", border: "1px solid #d97706", borderRadius: "6px", padding: "0 10px", fontWeight: "700" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#78350f", display: "block", marginBottom: "4px" }}>
                      INITIAL MANTIS POOL ALLOCATION (₹)
                    </label>
                    <input
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      style={{ width: "100%", height: "38px", border: "1px solid #d97706", borderRadius: "6px", padding: "0 10px", fontWeight: "700" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleApprove}
                    style={{ flex: 2, height: "42px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}
                  >
                    ✓ Approve & Issue Agent Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectMode(true)}
                    style={{ flex: 1, height: "42px", background: "#ffffff", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                  >
                    Reject KYC...
                  </button>
                </div>
              </div>
            )}

            {rejectMode && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "13.5px", fontWeight: "700", color: "#991b1b" }}>
                  Provide Reason for Rejection:
                </h4>
                <textarea
                  rows="3"
                  placeholder="e.g. GST certificate name mismatch, shop photo not clear, missing sign..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #f87171", fontSize: "13px", boxSizing: "border-box", marginBottom: "10px" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleReject}
                    style={{ background: "#dc2626", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                  >
                    Confirm Rejection
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectMode(false)}
                    style={{ background: "#ffffff", color: "#475569", border: "1px solid #cbd5e1", padding: "8px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentEnquiries;
