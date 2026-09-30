// Shared Agent Service for Admin Panel
const AGENT_ENQUIRIES_KEY = "aibus_agent_enquiries";
const APPROVED_AGENTS_KEY = "aibus_approved_agents";

const DEFAULT_ENQUIRIES = [
  {
    id: "ENQ-2026-7841",
    agencyName: "Bharat Yatra Express",
    legalEntity: "Private Limited",
    ownerName: "Sanjay Sharma",
    mobile: "9876543210",
    email: "sanjay@bharatyatra.com",
    address: "Shop 14, Majestic Bus Terminal Complex",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560009",
    gstin: "29AABCB1234C1Z1",
    pan: "AABCB1234C",
    depositPreference: "₹25,000",
    appliedDate: "2026-09-30 11:20:00",
    status: "PENDING",
    documents: [
      { type: "PAN Card", name: "pan_card_sanjay_sharma.pdf", size: "1.2 MB", verified: true },
      { type: "GST Certificate", name: "gst_certificate_bharat_yatra.pdf", size: "2.1 MB", verified: true },
      { type: "Shop/Office Photo", name: "agency_front_majestic.jpg", size: "3.4 MB", verified: false },
      { type: "Cancelled Cheque", name: "cancelled_cheque_hdfc.jpg", size: "850 KB", verified: true },
    ],
  },
  {
    id: "ENQ-2026-9023",
    agencyName: "Royal Deccan Travels",
    legalEntity: "Partnership Firm",
    ownerName: "Mohammed Asif",
    mobile: "9123456780",
    email: "asif@royaldeccan.in",
    address: "Plot 45, Nampally Station Road",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    gstin: "36XYZPA9876Q1Z9",
    pan: "XYZPA9876Q",
    depositPreference: "₹50,000",
    appliedDate: "2026-09-29 16:45:00",
    status: "PENDING",
    documents: [
      { type: "PAN Card", name: "pan_asif_mohammed.pdf", size: "980 KB", verified: false },
      { type: "GST Certificate", name: "gst_royal_deccan.pdf", size: "1.8 MB", verified: false },
      { type: "Shop/Office Photo", name: "office_nampally_hyd.jpg", size: "4.1 MB", verified: false },
      { type: "Cancelled Cheque", name: "sbi_cancelled_cheque.pdf", size: "1.1 MB", verified: false },
    ],
  },
];

const DEFAULT_AGENTS = [
  {
    agentCode: "AG-5091",
    agencyName: "Ramesh Travels & Tours",
    ownerName: "Ramesh Chandra",
    mobile: "9845012345",
    email: "ramesh@travels.in",
    city: "Bengaluru",
    state: "Karnataka",
    address: "Shop 4, Anand Rao Circle, Gandhinagar",
    gstin: "29ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    status: "APPROVED",
    commissionPct: 10,
    walletBalance: 19978.55,
    approvedAt: "2026-08-15",
    totalBookings: 56,
    monthlyCommission: 14250,
    documentsVerified: true,
  },
  {
    agentCode: "AG-4412",
    agencyName: "Coastal Holiday Planners",
    ownerName: "Kavita Rao",
    mobile: "9822019944",
    email: "kavita@coastalholidays.com",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "12, Koyambedu Market Road",
    gstin: "33AABCC5544D1Z2",
    pan: "AABCC5544D",
    status: "APPROVED",
    commissionPct: 12,
    walletBalance: 34500.00,
    approvedAt: "2026-07-20",
    totalBookings: 94,
    monthlyCommission: 28400,
    documentsVerified: true,
  }
];

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
      console.warn("Backend enquiries API offline, using local cache:", e.message);
    }

    try {
      const stored = localStorage.getItem(AGENT_ENQUIRIES_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_ENQUIRIES;
    } catch {
      return DEFAULT_ENQUIRIES;
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
      console.warn("Backend approved agents API offline, using local cache:", e.message);
    }

    try {
      const stored = localStorage.getItem(APPROVED_AGENTS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_AGENTS;
    } catch {
      return DEFAULT_AGENTS;
    }
  }

  async approveEnquiry(enquiryId, { commissionPct = 10, initialBalance = 19978.55 }) {
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
      console.warn("Backend approve failed/offline, processing locally:", e.message);
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
    if (!approvedAgent) {
      const randomCode = `AG-${Math.floor(5000 + Math.random() * 4999)}`;
      approvedAgent = {
        agentCode: randomCode,
        agencyName: enq?.agencyName || "New Travel Agency",
        ownerName: enq?.ownerName || "Agency Partner",
        mobile: enq?.mobile || "9800000000",
        email: enq?.email || "partner@agency.com",
        password: "agent" + (enq?.mobile ? enq.mobile.slice(-4) : "1234"),
        city: enq?.city || "National",
        state: enq?.state || "India",
        address: enq?.address || "HQ",
        gstin: enq?.gstin || "NOT PROVIDED",
        pan: enq?.pan || "NOT PROVIDED",
        status: "APPROVED",
        commissionPct: Number(commissionPct),
        walletBalance: Number(initialBalance),
        approvedAt: new Date().toISOString().substring(0, 10),
        totalBookings: 0,
        monthlyCommission: 0,
        documentsVerified: true,
      };
    }

    agents.unshift(approvedAgent);
    localStorage.setItem(APPROVED_AGENTS_KEY, JSON.stringify(agents));
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
      console.warn("Backend reject failed/offline, processing locally:", e.message);
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
