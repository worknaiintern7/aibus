import api from "./api";

const AGENT_ENQUIRIES_KEY = "aibus_agent_enquiries";
const APPROVED_AGENTS_KEY = "aibus_approved_agents";
const CURRENT_AGENT_KEY = "aibus_current_agent";
const AGENT_BOOKINGS_KEY = "aibus_agent_bookings";

const DEFAULT_ENQUIRIES = [];
const DEFAULT_AGENTS = [];
const DEFAULT_BOOKINGS = [];

class AgentService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(AGENT_ENQUIRIES_KEY)) {
      localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(DEFAULT_ENQUIRIES));
    }
    if (!localStorage.getItem(APPROVED_AGENTS_KEY)) {
      localStorage.setItem(APPROVED_AGENTS_KEY, JSON.stringify(DEFAULT_AGENTS));
    }
    if (!localStorage.getItem(AGENT_BOOKINGS_KEY)) {
      localStorage.setItem(AGENT_BOOKINGS_KEY, JSON.stringify(DEFAULT_BOOKINGS));
    }
  }

  // ----------------------------------------------------
  // Agent Application & Enquiry
  // ----------------------------------------------------
  getEnquiries() {
    this.initStorage();
    try {
      return JSON.parse(localStorage.getItem(AGENT_ENQUIRIES_KEY)) || [];
    } catch {
      return DEFAULT_ENQUIRIES;
    }
  }

  async submitEnquiry(formData) {
    const list = this.getEnquiries();
    const newId = `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const fallbackEnquiry = {
      id: newId,
      agencyName: formData.agencyName,
      legalEntity: formData.legalEntity || "Proprietorship",
      ownerName: formData.ownerName,
      mobile: formData.mobile,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      gstin: (formData.gstin || "NOT PROVIDED").toUpperCase(),
      pan: (formData.pan || "NOT PROVIDED").toUpperCase(),
      depositPreference: formData.depositPreference || "₹10,000",
      appliedDate: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: "PENDING",
      documents: formData.documents || [
        { type: "PAN Card", name: `${formData.pan || "pan"}_document.pdf`, size: "1.4 MB", verified: false },
        { type: "GST Certificate", name: `${formData.gstin || "gst"}_certificate.pdf`, size: "2.3 MB", verified: false },
        { type: "Shop/Office Photo", name: "agency_storefront.jpg", size: "3.2 MB", verified: false },
        { type: "Cancelled Cheque", name: "bank_cheque_leaf.jpg", size: "890 KB", verified: false },
      ],
    };

    let saved = fallbackEnquiry;
    try {
      const res = await api.post("/api/agents/register", fallbackEnquiry);
      if (res.data?.success && res.data?.data) {
        saved = res.data.data;
      }
    } catch (e) {
      console.warn("Backend API register failed/offline, using local storage:", e.message);
    }

    list.unshift(saved);
    localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(list));
    return saved;
  }

  // ----------------------------------------------------
  // Admin Approvals & Rejections
  // ----------------------------------------------------
  approveEnquiry(enquiryId, { commissionPct = 10, initialBalance = 19978.55 }) {
    const enquiries = this.getEnquiries();
    const enqIndex = enquiries.findIndex((e) => e.id === enquiryId);
    if (enqIndex === -1) throw new Error("Enquiry not found");

    const enquiry = enquiries[enqIndex];
    enquiry.status = "APPROVED";
    enquiry.approvedAt = new Date().toISOString().substring(0, 10);
    localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Register active agent in approved agents
    const agents = this.getApprovedAgents();
    const randomCode = `AG-${Math.floor(5000 + Math.random() * 4999)}`;
    const newAgent = {
      agentCode: randomCode,
      agencyName: enquiry.agencyName,
      ownerName: enquiry.ownerName,
      mobile: enquiry.mobile,
      email: enquiry.email,
      password: "agent" + enquiry.mobile.slice(-4), // default password
      city: enquiry.city,
      state: enquiry.state,
      address: enquiry.address,
      gstin: enquiry.gstin,
      pan: enquiry.pan,
      status: "APPROVED",
      commissionPct: Number(commissionPct),
      walletBalance: Number(initialBalance),
      approvedAt: enquiry.approvedAt,
      totalBookings: 0,
      monthlyCommission: 0,
      documentsVerified: true,
    };

    agents.unshift(newAgent);
    localStorage.setItem(APPROVED_AGENTS_KEY, JSON.stringify(agents));
    return newAgent;
  }

  rejectEnquiry(enquiryId, reason = "Documents verification failed") {
    const enquiries = this.getEnquiries();
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) throw new Error("Enquiry not found");

    enq.status = "REJECTED";
    enq.rejectionReason = reason;
    enq.rejectedAt = new Date().toISOString().substring(0, 10);
    localStorage.setItem(AGENT_ENQUIRIES_KEY, JSON.stringify(enquiries));
    return enq;
  }

  getApprovedAgents() {
    this.initStorage();
    try {
      return JSON.parse(localStorage.getItem(APPROVED_AGENTS_KEY)) || [];
    } catch {
      return DEFAULT_AGENTS;
    }
  }

  // ----------------------------------------------------
  // Agent Authentication & Session
  // ----------------------------------------------------
  async agentLogin(identifier, password) {
    this.initStorage();
    const cleanId = (identifier || "").trim().toLowerCase();

    // 1. Try backend authentication first
    try {
      const res = await api.post("/api/agents/login", { identifier: cleanId, password });
      if (res.data?.success && res.data?.data) {
        const agent = res.data.data;
        localStorage.setItem(CURRENT_AGENT_KEY, JSON.stringify(agent));
        return { success: true, agent };
      }
      if (res.data?.isPending) {
        return { success: false, isPending: true, message: res.data.message };
      }
      if (res.data?.isRejected) {
        return { success: false, isRejected: true, message: res.data.message };
      }
    } catch (e) {
      console.warn("Backend login failed or offline, checking local agent database:", e.message);
    }

    // 2. Check local approved agents
    const agents = this.getApprovedAgents();
    const agent = agents.find(
      (a) =>
        (a.agentCode.toLowerCase() === cleanId ||
          a.mobile === cleanId ||
          a.email.toLowerCase() === cleanId) &&
        a.password === password
    );

    if (agent) {
      localStorage.setItem(CURRENT_AGENT_KEY, JSON.stringify(agent));
      return { success: true, agent };
    }

    // 3. Check if it's a pending enquiry
    const enquiries = this.getEnquiries();
    const pendingEnq = enquiries.find(
      (e) =>
        e.id.toLowerCase() === cleanId ||
        e.mobile === cleanId ||
        e.email.toLowerCase() === cleanId
    );

    if (pendingEnq) {
      if (pendingEnq.status === "PENDING") {
        return {
          success: false,
          isPending: true,
          message: `Application #${pendingEnq.id} for "${pendingEnq.agencyName}" is under verification by AIBus Admin. You will receive activation notification once approved.`,
        };
      }
      if (pendingEnq.status === "REJECTED") {
        return {
          success: false,
          isRejected: true,
          message: `Application #${pendingEnq.id} was not approved: ${pendingEnq.rejectionReason || "Verification criteria not met"}.`,
        };
      }
    }

    return {
      success: false,
      message: "Invalid Agent Code, Mobile, or Password. Please check credentials or register as new partner.",
    };
  }

  getCurrentAgent() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_AGENT_KEY));
    } catch {
      return null;
    }
  }

  agentLogout() {
    localStorage.removeItem(CURRENT_AGENT_KEY);
  }

  // ----------------------------------------------------
  // Agent Wallet & Booking Actions
  // ----------------------------------------------------
  async refreshAgentBalance() {
    const current = this.getCurrentAgent();
    if (!current) return 19978.55;

    try {
      const res = await api.get("/api/gds/balance");
      if (res.data?.success && res.data?.data?.Balance != null) {
        current.walletBalance = Number(res.data.data.Balance);
        this.updateCurrentAgent(current);
        return current.walletBalance;
      }
    } catch (e) {
      console.warn("Could not fetch remote Mantis balance, using cached wallet balance:", e.message);
    }
    return current.walletBalance || 19978.55;
  }

  updateCurrentAgent(updatedAgent) {
    localStorage.setItem(CURRENT_AGENT_KEY, JSON.stringify(updatedAgent));
    const list = this.getApprovedAgents();
    const idx = list.findIndex((a) => a.agentCode === updatedAgent.agentCode);
    if (idx !== -1) {
      list[idx] = updatedAgent;
      localStorage.setItem(APPROVED_AGENTS_KEY, JSON.stringify(list));
    }
  }

  topupWallet(amount) {
    const agent = this.getCurrentAgent();
    if (!agent) throw new Error("No agent logged in");

    agent.walletBalance = (Number(agent.walletBalance) || 0) + Number(amount);
    this.updateCurrentAgent(agent);
    return agent.walletBalance;
  }

  getAgentBookings() {
    this.initStorage();
    try {
      return JSON.parse(localStorage.getItem(AGENT_BOOKINGS_KEY)) || [];
    } catch {
      return DEFAULT_BOOKINGS;
    }
  }

  recordAgentBooking(booking) {
    const bookings = this.getAgentBookings();
    bookings.unshift(booking);
    localStorage.setItem(AGENT_BOOKINGS_KEY, JSON.stringify(bookings));

    const agent = this.getCurrentAgent();
    if (agent) {
      agent.totalBookings = (agent.totalBookings || 0) + 1;
      agent.monthlyCommission = (agent.monthlyCommission || 0) + (booking.commissionAmt || 0);
      agent.walletBalance = Math.max(0, (agent.walletBalance || 0) - (booking.netPayable || 0));
      this.updateCurrentAgent(agent);
    }
    return booking;
  }
}

export const agentService = new AgentService();
export default agentService;
