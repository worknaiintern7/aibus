import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Wallet, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles,
  QrCode,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import "./RazorpayModal.css";

function RazorpayModal({
  isOpen,
  onClose,
  amount,
  busName,
  from,
  to,
  seats = [],
  customerPhone = "",
  customerEmail = "",
  onPaymentSuccess,
  onPaymentFailure,
}) {
  const [activeTab, setActiveTab] = useState("upi"); // upi | card | netbanking | wallet
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select"); // select | processing | success | failed
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [selectedWallet, setSelectedWallet] = useState("AmazonPay");
  const [orderId] = useState(() => `order_live_${Math.floor(100000 + Math.random() * 900000)}`);
  const [countdown, setCountdown] = useState(480); // 8 minutes payment window

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep("select");
      setIsProcessing(false);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCountdown = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCardInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
    const parts = val.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(" ") : val);
  };

  const handleExpiryInput = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleSimulatePayment = (success = true) => {
    setIsProcessing(true);
    setPaymentStep("processing");

    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        setPaymentStep("success");
        setTimeout(() => {
          onPaymentSuccess?.({
            paymentId: `pay_gds_${Math.floor(100000000 + Math.random() * 900000000)}`,
            orderId,
            signature: `sig_${Math.random().toString(36).substring(2, 15)}`,
            method: activeTab,
            amount,
          });
        }, 1200);
      } else {
        setPaymentStep("failed");
      }
    }, 2000);
  };

  const banks = [
    { id: "HDFC", name: "HDFC Bank", logo: "🏦" },
    { id: "SBI", name: "State Bank of India", logo: "🏛️" },
    { id: "ICICI", name: "ICICI Bank", logo: "🏢" },
    { id: "AXIS", name: "Axis Bank", logo: "🏬" },
    { id: "KOTAK", name: "Kotak Mahindra", logo: "🏪" },
    { id: "PNB", name: "Punjab National", logo: "🏦" },
  ];

  const wallets = [
    { id: "AmazonPay", name: "Amazon Pay", icon: "📦" },
    { id: "Mobikwik", name: "MobiKwik", icon: "⚡" },
    { id: "PhonePeWallet", name: "PhonePe Wallet", icon: "🟣" },
    { id: "PaytmWallet", name: "Paytm Wallet", icon: "💳" },
  ];

  return (
    <div className="rzp-overlay" onClick={onClose}>
      <div className="rzp-container" onClick={(e) => e.stopPropagation()}>
        {/* Razorpay Top Header */}
        <div className="rzp-header">
          <div className="rzp-brand-row">
            <div className="rzp-merchant-info">
              <div className="rzp-logo-badge">
                <Sparkles size={16} className="rzp-sparkle" />
              </div>
              <div>
                <h3 className="rzp-merchant-name">AIBus Travels Pvt. Ltd.</h3>
                <span className="rzp-order-id">Mantis GDS Live • #{orderId}</span>
              </div>
            </div>
            <button className="rzp-close-btn" onClick={onClose} aria-label="Close Payment Modal">
              <X size={18} />
            </button>
          </div>

          <div className="rzp-amount-row">
            <div className="rzp-amount-block">
              <span className="rzp-amount-label">AMOUNT TO PAY</span>
              <div className="rzp-amount-val">
                <span className="rzp-currency">₹</span>
                {Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="rzp-countdown-badge">
              <Lock size={12} />
              <span>Expires in {formatCountdown(countdown)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Payment Body */}
        {paymentStep === "processing" ? (
          <div className="rzp-state-screen">
            <div className="rzp-spinner"></div>
            <h4 className="rzp-state-title">Processing Secure Payment...</h4>
            <p className="rzp-state-desc">
              Authorizing with Razorpay sandbox & verifying seat lock with Mantis GDS. Please do not refresh.
            </p>
            <div className="rzp-security-tag">
              <ShieldCheck size={14} /> 256-bit Bank Grade Security
            </div>
          </div>
        ) : paymentStep === "success" ? (
          <div className="rzp-state-screen success">
            <div className="rzp-success-circle">
              <CheckCircle2 size={44} />
            </div>
            <h4 className="rzp-state-title">Payment Successful!</h4>
            <p className="rzp-state-desc">
              Transaction ID: pay_gds_{Math.floor(100000000 + Math.random() * 900000000)}
            </p>
            <span className="rzp-confirming-msg">
              <RefreshCw size={14} className="spin-icon" /> Finalizing Mantis Ticket & PNR...
            </span>
          </div>
        ) : paymentStep === "failed" ? (
          <div className="rzp-state-screen failed">
            <div className="rzp-failed-circle">
              <AlertCircle size={44} />
            </div>
            <h4 className="rzp-state-title">Transaction Cancelled or Failed</h4>
            <p className="rzp-state-desc">
              Your bank could not complete the demo transaction. Your seats are still held.
            </p>
            <button className="rzp-retry-btn" onClick={() => setPaymentStep("select")}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="rzp-main-layout">
            {/* Left Method Switcher */}
            <div className="rzp-method-sidebar">
              <button
                className={`rzp-tab-btn ${activeTab === "upi" ? "active" : ""}`}
                onClick={() => setActiveTab("upi")}
              >
                <Smartphone size={18} />
                <span>UPI / QR</span>
                <span className="rzp-popular-badge">FAST</span>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === "card" ? "active" : ""}`}
                onClick={() => setActiveTab("card")}
              >
                <CreditCard size={18} />
                <span>Cards</span>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === "netbanking" ? "active" : ""}`}
                onClick={() => setActiveTab("netbanking")}
              >
                <Building2 size={18} />
                <span>NetBanking</span>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
                onClick={() => setActiveTab("wallet")}
              >
                <Wallet size={18} />
                <span>Wallets</span>
              </button>
            </div>

            {/* Right Method Detail */}
            <div className="rzp-method-content">
              {/* UPI Tab */}
              {activeTab === "upi" && (
                <div className="rzp-upi-view">
                  <div className="rzp-qr-box">
                    <div className="rzp-qr-code-graphic">
                      <QrCode size={120} className="rzp-mock-qr" />
                      <div className="rzp-qr-center-logo">₹</div>
                    </div>
                    <div className="rzp-qr-text">
                      <strong>Scan with any UPI App</strong>
                      <span>Google Pay, PhonePe, Paytm, BHIM, Cred</span>
                    </div>
                  </div>

                  <div className="rzp-divider-or">
                    <span>OR ENTER UPI ID</span>
                  </div>

                  <div className="rzp-input-field">
                    <input
                      type="text"
                      placeholder="e.g. mobileNumber@upi / yourname@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === "card" && (
                <div className="rzp-card-view">
                  <div className="rzp-field-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8890"
                      value={cardNumber}
                      onChange={handleCardInput}
                      maxLength={19}
                    />
                  </div>

                  <div className="rzp-card-grid">
                    <div className="rzp-field-group">
                      <label>Expires (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryInput}
                        maxLength={5}
                      />
                    </div>
                    <div className="rzp-field-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="rzp-card-badges">
                    <span>💳 Visa</span>
                    <span>💳 Mastercard</span>
                    <span>💳 RuPay</span>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {activeTab === "netbanking" && (
                <div className="rzp-netbanking-view">
                  <span className="rzp-sub-label">Select Your Bank:</span>
                  <div className="rzp-banks-grid">
                    {banks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`rzp-bank-card ${selectedBank === b.id ? "selected" : ""}`}
                        onClick={() => setSelectedBank(b.id)}
                      >
                        <span className="bank-logo">{b.logo}</span>
                        <span className="bank-name">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallets Tab */}
              {activeTab === "wallet" && (
                <div className="rzp-wallets-view">
                  <span className="rzp-sub-label">Choose Mobile Wallet:</span>
                  <div className="rzp-wallets-list">
                    {wallets.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        className={`rzp-wallet-card ${selectedWallet === w.id ? "selected" : ""}`}
                        onClick={() => setSelectedWallet(w.id)}
                      >
                        <span className="wallet-icon">{w.icon}</span>
                        <span className="wallet-name">{w.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary of bus */}
              <div className="rzp-journey-badge">
                <span>{from} ➔ {to}</span>
                <span className="rzp-dot-sep">•</span>
                <span>{seats.length} Seat{seats.length > 1 ? "s" : ""} ({seats.join(", ")})</span>
              </div>

              {/* Action Buttons: Demo Razorpay Simulation */}
              <div className="rzp-action-row">
                <button
                  type="button"
                  className="rzp-pay-cta"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={isProcessing}
                >
                  <span>Pay ₹{Number(amount || 0).toLocaleString("en-IN")}</span>
                  <ArrowRight size={16} />
                </button>

                {import.meta.env.DEV && (
                  <button
                    type="button"
                    className="rzp-fail-sim-btn"
                    onClick={() => handleSimulatePayment(false)}
                    disabled={isProcessing}
                    title="Simulate bank gateway failure to test fallback"
                  >
                    Simulate Bank Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Razorpay Footer Branding */}
        <div className="rzp-footer">
          <div className="rzp-footer-trust">
            <ShieldCheck size={16} className="rzp-shield-gold" />
            <span>Secured by <strong>Razorpay</strong> • RBI Authorized • 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RazorpayModal;
