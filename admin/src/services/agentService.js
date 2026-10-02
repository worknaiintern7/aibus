// Agent Service for Admin Panel - live API data only
const AGENT_ENQUIRIES_KEY = "aibus_agent_enquiries";
const APPROVED_AGENTS_KEY = "aibus_approved_agents";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

// Agent KYC endpoints are admin-only on the backend: send the admin token with every call
function agentApi(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  return fetch(`${API_BASE}/api/agents${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

class AdminAgentService {
  async getEnquiries() {
    try {
      const res = await agentApi("/enquiries");
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(json.data));
        return json.data;
      }
    } catch (e) {
      console.warn("Backend enquiries API offline or empty:", e.message);
    }

    try {
      const stored = localStorage.getItem(AGENT_ENQUIRIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async getApprovedAgents() {
    try {
      const res = await agentApi("/approved");
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        localStorage.setItem(APPROVED_AGENTS_KEY, JSON.stringify(json.data));
        return json.data;
      }
    } catch (e) {
      console.warn("Backend approved agents API offline or empty:", e.message);
    }

    try {
      const stored = localStorage.getItem(APPROVED_AGENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async approveEnquiry(enquiryId, { commissionPct = 10, initialBalance = 0 }) {
    let approvedAgent = null;

    try {
      const res = await agentApi(`/enquiries/${enquiryId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionPct, initialBalance }),
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        approvedAgent = json.data;
      }
    } catch (e) {
      console.warn("Backend approve failed:", e.message);
      throw e;
    }

    // Local state sync
    const enquiries = await this.getEnquiries();
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (enq) {
      enq.status = "APPROVED";
      enq.approvedAt = new Date().toISOString().substring(0, 10);
      localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(enquiries));
    }

    const agents = await this.getApprovedAgents();
    if (approvedAgent) {
      agents.unshift(approvedAgent);
      localStorage.setItem(APPROVED_AGENTS_KEY, JSON.stringify(agents));
    }
    return approvedAgent;
  }

  async rejectEnquiry(enquiryId, reason = "Documents criteria not satisfied") {
    try {
      await agentApi(`/enquiries/${enquiryId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
    } catch (e) {
      console.warn("Backend reject failed:", e.message);
      throw e;
    }

    const enquiries = await this.getEnquiries();
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (enq) {
      enq.status = "REJECTED";
      enq.rejectionReason = reason;
      enq.rejectedAt = new Date().toISOString().substring(0, 10);
      localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(enquiries));
    }
    return enq;
  }
}

export const adminAgentService = new AdminAgentService();
export default adminAgentService;
