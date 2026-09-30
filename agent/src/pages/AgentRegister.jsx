import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Phone,
  ArrowRight,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import agentService from "../services/agentService";
import "./AgentPortal.css";

function AgentRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agencyName: "",
    legalEntity: "Proprietorship",
    ownerName: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    gstin: "",
    pan: "",
    depositPreference: "₹10,000",
  });

  const [documents, setDocuments] = useState({
    panDoc: null,
    gstDoc: null,
    shopPhoto: null,
    chequeDoc: null,
  });

  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMockUpload = (docKey, filename) => {
    setDocuments((prev) => ({
      ...prev,
      [docKey]: {
        name: filename,
        size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleTimeString(),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.agencyName || !formData.ownerName || !formData.mobile || !formData.email) {
      setError("Please fill in all mandatory agency details.");
      return;
    }

    if (formData.mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.pan) {
      setError("Business or Personal PAN is required for Mantis GDS ticketing compliance.");
      return;
    }

    setSubmitting(true);

    setTimeout(async () => {
      try {
        const docsList = [
          {
            type: "PAN Card",
            name: documents.panDoc?.name || `${formData.pan}_pan_card.pdf`,
            size: documents.panDoc?.size || "1.2 MB",
            verified: false,
          },
          {
            type: "GST Certificate",
            name: documents.gstDoc?.name || `${formData.gstin || "gst"}_cert.pdf`,
            size: documents.gstDoc?.size || "2.1 MB",
            verified: false,
          },
          {
            type: "Shop/Office Photo",
            name: documents.shopPhoto?.name || "agency_storefront.jpg",
            size: documents.shopPhoto?.size || "3.4 MB",
            verified: false,
          },
          {
            type: "Cancelled Cheque",
            name: documents.chequeDoc?.name || "bank_cheque_leaf.jpg",
            size: documents.chequeDoc?.size || "850 KB",
            verified: false,
          },
        ];

        const enquiry = await agentService.submitEnquiry({
          ...formData,
          documents: docsList,
        });

        setSubmittedEnquiry(enquiry);
      } catch (err) {
        setError(err.message || "Failed to submit enquiry. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }, 800);
  };

  if (submittedEnquiry) {
    return (
      <main className="agent-landing-page">
        <div className="agent-landing-container" style={{ maxWidth: "680px" }}>
          <div className="agent-success-card">
            <div className="success-icon-badge">
              <CheckCircle2 size={48} />
            </div>

            <span className="success-tag">APPLICATION SUBMITTED SUCCESSFULLY</span>
            <h2 className="success-title">Welcome to AIBus Partner Network!</h2>
            
            <p className="success-desc">
              Your travel agency onboarding application has been forwarded to the AIBus Compliance Desk. Documents verification is in progress.
            </p>

            <div className="enquiry-ref-box">
              <span className="ref-lbl">YOUR ENQUIRY REFERENCE ID</span>
              <strong className="ref-code">{submittedEnquiry.id}</strong>
              <span className="ref-agency">{submittedEnquiry.agencyName} • {submittedEnquiry.city}</span>
            </div>

            <div className="next-steps-list">
              <h4>What happens next?</h4>
              <ul>
                <li>⚡ Admin verification desk reviews your PAN, GSTIN & storefront details.</li>
                <li>📲 You will receive an SMS & Email notification with your activated <strong>Agent Code</strong> and default password.</li>
                <li>⏱️ Standard turnaround time: <strong>2 to 4 business hours</strong>.</li>
              </ul>
            </div>

            <div className="success-btn-group">
              <Link to="/login" className="btn-agent-primary">
                <span>Go to Agent Login</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/" className="btn-agent-subtle">
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="agent-landing-page">
      <div className="agent-landing-container" style={{ maxWidth: "840px" }}>
        <div className="register-header-bar">
          <Link to="/" className="btn-back-link">
            <ArrowLeft size={16} />
            <span>Back to Partner Overview</span>
          </Link>
          <span className="reg-badge">MANTIS GDS B2B ONBOARDING</span>
        </div>

        <div className="agent-form-card">
          <div className="form-card-title-block">
            <h1 className="agent-form-title">Travel Agency KYC Registration</h1>
            <p className="agent-form-sub">
              Register your offline agency or ticketing counter to unlock live Mantis GDS inventory and earn direct commissions.
            </p>
          </div>

          {error && (
            <div className="agent-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="agent-kyc-form">
            {/* Section 1: Agency Profile */}
            <div className="form-section-block">
              <h3 className="section-head">
                <Building2 size={18} className="sec-icon-gold" />
                <span>1. Business & Agency Details</span>
              </h3>

              <div className="form-grid-2col">
                <div className="form-field">
                  <label>Agency / Trade Name *</label>
                  <input
                    type="text"
                    name="agencyName"
                    placeholder="e.g. Sri Krishna Travels & Tours"
                    value={formData.agencyName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Legal Entity Type *</label>
                  <select
                    name="legalEntity"
                    value={formData.legalEntity}
                    onChange={handleInputChange}
                  >
                    <option value="Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Individual">Individual Travel Agent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Owner & Contact */}
            <div className="form-section-block">
              <h3 className="section-head">
                <Phone size={18} className="sec-icon-gold" />
                <span>2. Authorized Contact Person</span>
              </h3>

              <div className="form-grid-2col">
                <div className="form-field">
                  <label>Owner / Primary Contact Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="e.g. Ramesh Chandra"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Mobile Number (For OTP & Login) *</label>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Official Business Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. bookings@srikrishnatravels.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>City & State *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <input
                      type="text"
                      name="city"
                      placeholder="City (e.g. Bengaluru)"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field full-span">
                  <label>Full Office / Shop Address *</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Shop No, Building Name, Street / Landmark, Pin Code"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Statutory Tax Codes */}
            <div className="form-section-block">
              <h3 className="section-head">
                <ShieldCheck size={18} className="sec-icon-gold" />
                <span>3. Tax & Business Verification (Mantis Compliance)</span>
              </h3>

              <div className="form-grid-2col">
                <div className="form-field">
                  <label>Business / Proprietor PAN *</label>
                  <input
                    type="text"
                    name="pan"
                    placeholder="e.g. ABCDE1234F"
                    maxLength={10}
                    value={formData.pan}
                    onChange={handleInputChange}
                    required
                    style={{ textTransform: "uppercase", letterSpacing: "1px" }}
                  />
                </div>

                <div className="form-field">
                  <label>GSTIN Number (Optional if unregistered)</label>
                  <input
                    type="text"
                    name="gstin"
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={handleInputChange}
                    style={{ textTransform: "uppercase", letterSpacing: "1px" }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Document Submission */}
            <div className="form-section-block">
              <h3 className="section-head">
                <FileText size={18} className="sec-icon-gold" />
                <span>4. KYC Proof Uploads</span>
              </h3>
              <p className="doc-hint">
                Attach clear PDF or JPG scans. Our admin team verifies documents before activating your booking wallet.
              </p>

              <div className="docs-grid-2col">
                <div className="doc-upload-box">
                  <div className="doc-meta">
                    <strong>Business / Personal PAN</strong>
                    <span>Mandatory for income tax reporting</span>
                  </div>
                  {documents.panDoc ? (
                    <span className="file-ready-tag">✓ {documents.panDoc.name}</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload-sim"
                      onClick={() => handleMockUpload("panDoc", `${formData.pan || "business"}_pan_card.pdf`)}
                    >
                      <Upload size={14} /> Attach PAN
                    </button>
                  )}
                </div>

                <div className="doc-upload-box">
                  <div className="doc-meta">
                    <strong>GST Registration Certificate</strong>
                    <span>Required for GST invoice claims</span>
                  </div>
                  {documents.gstDoc ? (
                    <span className="file-ready-tag">✓ {documents.gstDoc.name}</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload-sim"
                      onClick={() => handleMockUpload("gstDoc", "gst_registration_cert.pdf")}
                    >
                      <Upload size={14} /> Attach GST
                    </button>
                  )}
                </div>

                <div className="doc-upload-box">
                  <div className="doc-meta">
                    <strong>Agency Storefront / Shop Photo</strong>
                    <span>Verifies physical travel office</span>
                  </div>
                  {documents.shopPhoto ? (
                    <span className="file-ready-tag">✓ {documents.shopPhoto.name}</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload-sim"
                      onClick={() => handleMockUpload("shopPhoto", "storefront_photo.jpg")}
                    >
                      <Upload size={14} /> Attach Photo
                    </button>
                  )}
                </div>

                <div className="doc-upload-box">
                  <div className="doc-meta">
                    <strong>Cancelled Bank Cheque</strong>
                    <span>For weekly commission settlements</span>
                  </div>
                  {documents.chequeDoc ? (
                    <span className="file-ready-tag">✓ {documents.chequeDoc.name}</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload-sim"
                      onClick={() => handleMockUpload("chequeDoc", "bank_cancelled_cheque.jpg")}
                    >
                      <Upload size={14} /> Attach Cheque
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="form-submit-row">
              <button type="submit" className="btn-agent-submit" disabled={submitting}>
                {submitting ? "Submitting Application for Review..." : "Submit KYC Application for Admin Approval"}
              </button>
              <span className="legal-notice">
                By submitting, you agree to AIBus GDS partnership terms, Mantis cancellation guidelines, and statutory tax compliance.
              </span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AgentRegister;
