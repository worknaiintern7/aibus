import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles,
  QrCode,
  ArrowRight,
  Bus,
  RefreshCw
} from "lucide-react";
import busService, { getSeatsTotal } from "../../services/busService";
import bookingService from "../../services/bookingService";
import authService from "../../services/authService";
import "./Payment.css";

function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const busId = searchParams.get("busId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const pickupId = searchParams.get("pickupId");
  const dropoffId = searchParams.get("dropoffId");

  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [travellers, setTravellers] = useState([]);
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Payment states
  const [activeTab, setActiveTab] = useState("upi"); // upi | card | netbanking | wallet
  const [paymentStep, setPaymentStep] = useState("select"); // select | processing | success | failed
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [selectedWallet, setSelectedWallet] = useState("AmazonPay");
  const [orderId] = useState(() => `order_live_${Math.floor(100000 + Math.random() * 900000)}`);
  const [countdown, setCountdown] = useState(480);
  const [bookingError, setBookingError] = useState("");

  const loggedInUser = authService.getLoggedInUser();

  useEffect(() => {
    const lock = bookingService.getSeatLock();
    if (lock) {
      setSelectedSeats(lock.seats || []);
      setTravellers(lock.travellers || []);
      setContactMobile(lock.contactMobile || "");
      setContactEmail(lock.contactEmail || "");
    }

    if (!busId) {
      setLoading(false);
      return;
    }

    busService.getBusById(busId, from, to, date).then((b) => {
      setSelectedBus(b);
      setLoading(false);
    }).catch(() => {
      setSelectedBus(null);
      setLoading(false);
    });
  }, [busId, from, to, date]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalAmount = selectedBus ? getSeatsTotal(selectedBus, selectedSeats) : 0;
  const isLive = Boolean(selectedBus?.isLive);

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
    if (val.length >= 2) val = val.slice(0, 2) + "/" + val.slice(2);
    setCardExpiry(val);
  };

  const handleExecutePayment = async (simulateSuccess = true) => {
    setPaymentStep("processing");
    setBookingError("");

    setTimeout(async () => {
      if (!simulateSuccess) {
        setPaymentStep("failed");
        return;
      }

      setPaymentStep("success");

      try {
        const userMobile = loggedInUser?.mobile || contactMobile || "";
        const isGuest = !loggedInUser;

        const newBooking = isLive
          ? await bookingService.createLiveBooking({
              bus: selectedBus,
              travellers,
              seats: selectedSeats,
              pickupId,
              dropoffId,
              contactMobile: userMobile,
              contactEmail,
              userId: loggedInUser?.id || null,
              isGuest,
            })
          : await bookingService.createBooking({
              bus: selectedBus,
              travellers,
              seats: selectedSeats,
              totalAmount,
              userMobile,
              userId: loggedInUser?.id || null,
              isGuest,
            });

        setTimeout(() => {
          navigate(`/booking-success?bookingId=${newBooking.bookingId}&isGuest=${isGuest}`);
        }, 1200);
      } catch (err) {
        console.error("Booking post-payment failed:", err);
        setBookingError(err.message || "Payment received, but booking confirmation failed. Our support team will assist.");
        setPaymentStep("failed");
      }
    }, 1800);
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

  if (loading) {
    return (
      <main className="payment-page">
        <div className="payment-loading">
          <div className="rzp-spinner"></div>
          <p>Initializing Secure Razorpay Checkout...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-page">
      <div className="payment-container">
        {/* Navigation Breadcrumb */}
        <div className="payment-top-bar">
          <button type="button" className="payment-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>Return to Booking Review</span>
          </button>
          <div className="payment-timer-badge">
            <Lock size={13} />
            <span>Seat Lock Window: <strong>{formatCountdown(countdown)}</strong></span>
          </div>
        </div>

        <div className="payment-grid">
          {/* Left Column: Trip & Price Breakdown */}
          <div className="payment-summary-card">
            <div className="summary-header">
              <div className="summary-bus-icon">
                <Bus size={20} />
              </div>
              <div>
                <h2 className="summary-title">{selectedBus?.operator || "--"}</h2>
                <span className="summary-sub">{selectedBus?.busType || "--"}</span>
              </div>
            </div>

            <div className="summary-route">
              <div>
                <span className="route-lbl">From</span>
                <strong>{from || selectedBus?.from || "--"}</strong>
              </div>
              <div className="route-arrow">➔</div>
              <div>
                <span className="route-lbl">To</span>
                <strong>{to || selectedBus?.to || "--"}</strong>
              </div>
            </div>

            <div className="summary-details-list">
              <div className="summary-line">
                <span>Journey Date</span>
                <strong>{date || selectedBus?.date || "--"}</strong>
              </div>
              <div className="summary-line">
                <span>Selected Seats</span>
                <strong className="summary-seats-val">{selectedSeats.join(", ") || "--"}</strong>
              </div>
              <div className="summary-line">
                <span>Travellers</span>
                <strong>{travellers.length || 0} Passenger(s)</strong>
              </div>
            </div>

            <div className="summary-total-box">
              <span>Final Fare Payable</span>
              <strong>₹{Number(totalAmount || 0).toLocaleString("en-IN")}</strong>
            </div>

            <div className="summary-trust-badges">
              <span>🛡️ 100% Refundable per Policy</span>
              <span>⚡ Instant Mantis GDS PNR Issuance</span>
            </div>
          </div>

          {/* Right Column: Embedded Razorpay Portal */}
          <div className="payment-gateway-wrapper">
            <div className="rzp-standalone-card">
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
                  <div className="rzp-secure-badge">
                    <ShieldCheck size={14} /> Razorpay Trusted
                  </div>
                </div>

                <div className="rzp-amount-row">
                  <div className="rzp-amount-block">
                    <span className="rzp-amount-label">AMOUNT TO PAY</span>
                    <div className="rzp-amount-val">
                      <span className="rzp-currency">₹</span>
                      {Number(totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Screens */}
              {paymentStep === "processing" ? (
                <div className="rzp-state-screen">
                  <div className="rzp-spinner"></div>
                  <h4 className="rzp-state-title">Authorizing Demo Transaction...</h4>
                  <p className="rzp-state-desc">
                    Processing through Razorpay test gateway and calling Mantis HoldSeats / BookSeats. Please wait.
                  </p>
                  <div className="rzp-security-tag">
                    <ShieldCheck size={14} /> 256-bit Encrypted Transaction
                  </div>
                </div>
              ) : paymentStep === "success" ? (
                <div className="rzp-state-screen success">
                  <div className="rzp-success-circle">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="rzp-state-title">Payment Authorized!</h4>
                  <p className="rzp-state-desc">
                    Reference ID: pay_gds_{Math.floor(100000000 + Math.random() * 900000000)}
                  </p>
                  <span className="rzp-confirming-msg">
                    <RefreshCw size={14} className="spin-icon" /> Generating Confirmed PNR with Mantis...
                  </span>
                </div>
              ) : paymentStep === "failed" ? (
                <div className="rzp-state-screen failed">
                  <div className="rzp-failed-circle">
                    <AlertCircle size={48} />
                  </div>
                  <h4 className="rzp-state-title">Payment Simulation Failed</h4>
                  <p className="rzp-state-desc">
                    {bookingError || "The mock payment was declined. You can retry with a different test method."}
                  </p>
                  <button className="rzp-retry-btn" onClick={() => setPaymentStep("select")}>
                    Retry Payment
                  </button>
                </div>
              ) : (
                <div className="rzp-main-layout">
                  {/* Left Sidebar */}
                  <div className="rzp-method-sidebar">
                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeTab === "upi" ? "active" : ""}`}
                      onClick={() => setActiveTab("upi")}
                    >
                      <Smartphone size={18} />
                      <span>UPI / QR</span>
                      <span className="rzp-popular-badge">FAST</span>
                    </button>

                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeTab === "card" ? "active" : ""}`}
                      onClick={() => setActiveTab("card")}
                    >
                      <CreditCard size={18} />
                      <span>Cards</span>
                    </button>

                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeTab === "netbanking" ? "active" : ""}`}
                      onClick={() => setActiveTab("netbanking")}
                    >
                      <Building2 size={18} />
                      <span>NetBanking</span>
                    </button>

                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
                      onClick={() => setActiveTab("wallet")}
                    >
                      <Wallet size={18} />
                      <span>Wallets</span>
                    </button>
                  </div>

                  {/* Right Form */}
                  <div className="rzp-method-content">
                    {activeTab === "upi" && (
                      <div className="rzp-upi-view">
                        <div className="rzp-qr-box">
                          <div className="rzp-qr-code-graphic">
                            <QrCode size={110} className="rzp-mock-qr" />
                            <div className="rzp-qr-center-logo">₹</div>
                          </div>
                          <div className="rzp-qr-text">
                            <strong>Scan with any UPI App</strong>
                            <span>GPay, PhonePe, Paytm, BHIM, CRED</span>
                          </div>
                        </div>

                        <div className="rzp-divider-or">
                          <span>OR ENTER UPI ID</span>
                        </div>

                        <div className="rzp-input-field">
                          <input
                            type="text"
                            placeholder="e.g. 9876543210@upi / user@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

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

                    {activeTab === "wallet" && (
                      <div className="rzp-wallets-view">
                        <span className="rzp-sub-label">Select Mobile Wallet:</span>
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

                    <div className="rzp-action-row" style={{ marginTop: "20px" }}>
                      <button
                        type="button"
                        className="rzp-pay-cta"
                        onClick={() => handleExecutePayment(true)}
                      >
                        <span>Confirm & Pay ₹{Number(totalAmount || 0).toLocaleString("en-IN")}</span>
                        <ArrowRight size={16} />
                      </button>

                      <button
                        type="button"
                        className="rzp-fail-sim-btn"
                        onClick={() => handleExecutePayment(false)}
                      >
                        Simulate Bank Decline / Gateway Timeout
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Razorpay Footer */}
              <div className="rzp-footer">
                <div className="rzp-footer-trust">
                  <ShieldCheck size={16} className="rzp-shield-gold" />
                  <span>Secured by <strong>Razorpay</strong> • RBI Regulated • 256-bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Payment;
