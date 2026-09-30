import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Wallet,
  TrendingUp,
  Ticket,
  RefreshCw,
  Search,
  ShieldCheck,
  Plus,
  LogOut,
  Printer,
  Bus,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileText
} from "lucide-react";
import agentService from "../services/agentService";
import api from "../services/api";
import "./AgentPortal.css";

// Customer site (separate app): tickets are printed from its PNR page
const CUSTOMER_APP_URL = (import.meta.env.VITE_CUSTOMER_APP_URL || "http://localhost:5173").replace(/\/$/, "");

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function durationBetween(dep, arr) {
  if (!dep || !arr) return "";
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  let mins = ah * 60 + am - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60;
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

function busTypeLabel(type) {
  return String(type || "").replace(/_/g, " ").replace(/NON AC/, "Non-AC");
}

// Live GDS bus from /api/buses/search in the shape the dashboard cards use
function mapLiveBus(b) {
  const dep = (b.departureTime || "").slice(0, 5);
  const arr = (b.arrivalTime || "").slice(0, 5);
  return {
    id: `gds-${b.gdsBusId}`,
    gdsBusId: b.gdsBusId,
    operator: b.busName,
    busType: busTypeLabel(b.busType),
    departureTime: dep,
    arrivalTime: arr,
    duration: durationBetween(dep, arr),
    fare: Number(b.fare || 0),
    availableSeats: b.availableSeats,
  };
}

function AgentDashboard() {
  const navigate = useNavigate();
  const [currentAgent, setCurrentAgent] = useState(() => agentService.getCurrentAgent());
  const [activeTab, setActiveTab] = useState("booking"); // booking | ledger | wallet | profile | telemetry

  // Wallet and metrics
  const [balance, setBalance] = useState(() => currentAgent?.walletBalance || 19978.55);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [topupAmount, setTopupAmount] = useState(5000);
  const [topupSuccess, setTopupSuccess] = useState(false);

  // B2B Bus Search state
  const [fromCity, setFromCity] = useState("Bangalore");
  const [toCity, setToCity] = useState("Chennai");
  const [travelDate, setTravelDate] = useState(tomorrowIso);
  const [searchLoading, setSearchLoading] = useState(false);
  const [buses, setBuses] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Fast Booking Modal
  const [bookingBus, setBookingBus] = useState(null);
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("28");
  const [passengerGender, setPassengerGender] = useState("M");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingSuccessModal, setBookingSuccessModal] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  // Live seat chart of the bus being booked
  const [busDetails, setBusDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [pickupId, setPickupId] = useState("");
  const [dropoffId, setDropoffId] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Agent Ledger state
  const [bookingsList, setBookingsList] = useState([]);

  useEffect(() => {
    if (!currentAgent) {
      navigate("/login");
      return;
    }
    setBookingsList(agentService.getAgentBookings());
    refreshBalance();
    handleSearchBuses();
  }, []);

  const refreshBalance = async () => {
    setBalanceLoading(true);
    const updated = await agentService.refreshAgentBalance();
    setBalance(updated);
    setBalanceLoading(false);
  };

  const handleLogout = () => {
    agentService.agentLogout();
    navigate("/login");
  };

  const handleSearchBuses = async (e) => {
    e?.preventDefault();
    setSearchLoading(true);
    setHasSearched(true);

    setSearchError("");

    try {
      const res = await api.get("/api/buses/search", {
        params: { source: fromCity.trim(), destination: toCity.trim(), date: travelDate },
        timeout: 40000,
      });
      // Agents issue tickets on live GDS inventory only
      const live = (res.data?.data || []).filter((b) => b.provider === "GDS");
      setBuses(live.map(mapLiveBus));
    } catch (err) {
      setBuses([]);
      setSearchError(err.message || "Could not load buses. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpenBookModal = async (bus) => {
    setBookingBus(bus);
    setPassengerName("");
    setPassengerAge("28");
    setPassengerGender("M");
    setCustomerPhone("");
    setBusDetails(null);
    setSelectedSeat("");
    setPickupId("");
    setDropoffId("");
    setBookingError("");
    setDetailsLoading(true);

    try {
      const res = await api.get(`/api/gds/buses/${bus.gdsBusId}`, {
        params: { source: fromCity.trim(), destination: toCity.trim(), date: travelDate },
        timeout: 40000,
      });
      const details = res.data?.data;
      setBusDetails(details);
      setPickupId(details?.boardingPoints?.[0]?.id || "");
      setDropoffId(details?.droppingPoints?.[0]?.id || "");
    } catch (err) {
      setBookingError(err.message || "Could not load the seat chart for this bus.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const availableSeats = (busDetails?.decks || [])
    .flatMap((deck) => deck.seats.map((seat) => ({ ...seat, deck: deck.name })))
    .filter((seat) => seat.status === "AVAILABLE");
  const chosenSeat = availableSeats.find((seat) => seat.seatNumber === selectedSeat) || null;
  // Fare of the chosen seat (taxes included); before a seat is picked, the lowest seat fare
  const modalFare = Number(chosenSeat?.fare ?? busDetails?.fare ?? bookingBus?.fare ?? 0);
  const modalCommission = Math.round(modalFare * (Number(currentAgent?.commissionPct || 10) / 100));

  const handleConfirmAgentBooking = async () => {
    if (!passengerName.trim()) {
      setBookingError("Please enter the passenger name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(customerPhone)) {
      setBookingError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!chosenSeat || !pickupId || !dropoffId) {
      setBookingError("Please select a seat, boarding point and dropping point.");
      return;
    }

    setBookingInProgress(true);
    setBookingError("");

    try {
      // 1. Hold the seat with the operator
      const holdRes = await api.post(
        "/api/gds/bookings/hold",
        {
          source: fromCity.trim(),
          destination: toCity.trim(),
          journeyDate: travelDate,
          busId: bookingBus.gdsBusId,
          pickupId,
          dropoffId,
          contactMobile: customerPhone,
          passengers: [
            {
              name: passengerName.trim(),
              age: parseInt(passengerAge, 10) || 0,
              gender: passengerGender === "F" ? "Female" : "Male",
              seatNumber: chosenSeat.seatNumber,
              mobile: customerPhone,
            },
          ],
        },
        { timeout: 60000 }
      );
      const held = holdRes.data?.data;

      // 2. Issue the ticket: PNR and ticket number come from the operator
      const confirmRes = await api.post(`/api/gds/bookings/${held.bookingReference}/confirm`, null, {
        timeout: 90000,
      });
      const ticket = confirmRes.data?.data;

      const grossFare = Number(ticket.totalAmount || modalFare);
      const commPct = Number(currentAgent.commissionPct || 10);
      const commissionAmt = Math.round(grossFare * (commPct / 100));
      const netPayable = grossFare - commissionAmt;

      const newBooking = {
        bookingId: ticket.bookingReference,
        pnr: ticket.pnrNo,
        ticketNo: ticket.ticketNo,
        customerName: passengerName.trim(),
        customerPhone,
        route: `${fromCity} ➔ ${toCity}`,
        travelDate,
        departureTime: bookingBus.departureTime,
        seats: `Seat ${chosenSeat.seatNumber}`,
        grossFare,
        commPct,
        commissionAmt,
        netPayable,
        status: ticket.bookingStatus,
        operator: bookingBus.operator,
        bookedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      };

      agentService.recordAgentBooking(newBooking);
      setBookingsList(agentService.getAgentBookings());
      setBookingBus(null);
      setBookingSuccessModal(newBooking);
      refreshBalance();
      handleSearchBuses();
    } catch (err) {
      setBookingError(err.message || "The ticket could not be issued. Please try again.");
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleTopup = () => {
    if (topupAmount <= 0) return;
    const newBal = agentService.topupWallet(topupAmount);
    setBalance(newBal);
    setTopupSuccess(true);
    setTimeout(() => setTopupSuccess(false), 3000);
  };

  if (!currentAgent) return null;

  return (
    <main className="agent-dashboard-page">
      {/* Top Agent Bar */}
      <div className="agent-top-navbar">
        <div className="agent-nav-container">
          <div className="agent-brand-col">
            <div className="agent-logo-pill">
              <Briefcase size={16} />
              <span>B2B PORTAL</span>
            </div>
            <div>
              <div className="agency-title-row">
                <h2 className="agent-agency-name">{currentAgent.agencyName}</h2>
                <span className="agent-verified-badge">
                  <ShieldCheck size={13} /> Verified Partner
                </span>
                <span className="agent-code-tag">{currentAgent.agentCode}</span>
              </div>
              <span className="agent-loc-sub">{currentAgent.city}, {currentAgent.state} • Owner: {currentAgent.ownerName}</span>
            </div>
          </div>

          <div className="agent-header-actions">
            <div className="header-balance-pill">
              <span className="lbl">Mantis Pool Wallet:</span>
              <strong className="val">₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
              <button 
                type="button" 
                className="btn-refresh-sm" 
                onClick={refreshBalance} 
                disabled={balanceLoading}
                title="Refresh Live Balance"
              >
                <RefreshCw size={13} className={balanceLoading ? "spin-icon" : ""} />
              </button>
            </div>

            <button type="button" className="btn-agent-logout" onClick={handleLogout}>
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="agent-main-container">
        {/* Metric Cards Row */}
        <div className="agent-kpi-grid">
          <div className="agent-kpi-card gold-border">
            <div className="kpi-head">
              <span>MANTIS AGENT BALANCE</span>
              <Wallet size={18} className="kpi-gold-icon" />
            </div>
            <div className="kpi-amount">
              ₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="kpi-sub">
              <span>ClientId #50 Live Linked Pool</span>
            </div>
          </div>

          <div className="agent-kpi-card">
            <div className="kpi-head">
              <span>ASSIGNED COMMISSION</span>
              <TrendingUp size={18} className="kpi-gold-icon" />
            </div>
            <div className="kpi-amount text-gold">
              {currentAgent.commissionPct}%
            </div>
            <div className="kpi-sub">
              <span>Instant margin deducted at checkout</span>
            </div>
          </div>

          <div className="agent-kpi-card">
            <div className="kpi-head">
              <span>MONTHLY EARNINGS</span>
              <Sparkles size={18} className="kpi-gold-icon" />
            </div>
            <div className="kpi-amount text-green">
              ₹{(currentAgent.monthlyCommission || 14250).toLocaleString("en-IN")}
            </div>
            <div className="kpi-sub">
              <span>Total Tickets: {currentAgent.totalBookings || bookingsList.length}</span>
            </div>
          </div>

          <div className="agent-kpi-card">
            <div className="kpi-head">
              <span>MANTIS GDS NETWORK</span>
              <ShieldCheck size={18} className="kpi-gold-icon" />
            </div>
            <div className="kpi-amount">
              29,393
            </div>
            <div className="kpi-sub">
              <span className="text-green">● 100% Operational (OAS3)</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="agent-tabs-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === "booking" ? "active" : ""}`}
            onClick={() => setActiveTab("booking")}
          >
            <Bus size={16} />
            <span>B2B Bus Booking</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
            onClick={() => setActiveTab("ledger")}
          >
            <Ticket size={16} />
            <span>Agent Ticket Manifest ({bookingsList.length})</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
          >
            <Wallet size={16} />
            <span>Deposit & Wallet</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FileText size={16} />
            <span>Agency KYC & Profile</span>
          </button>
        </div>

        {/* TAB 1: B2B BUS BOOKING */}
        {activeTab === "booking" && (
          <div className="agent-section-card">
            <div className="card-top-header">
              <div>
                <h3 className="card-headline">Live Mantis Inventory Search & B2B Booking</h3>
                <p className="card-subtext">Book seats directly on live Mantis GDS routes with instant agent commission deduction.</p>
              </div>
            </div>

            <form onSubmit={handleSearchBuses} className="agent-search-form">
              <div className="search-field">
                <label>FROM CITY</label>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  required
                />
              </div>

              <div className="search-field">
                <label>TO CITY</label>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  placeholder="e.g. Chennai"
                  required
                />
              </div>

              <div className="search-field">
                <label>JOURNEY DATE</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-agent-search" disabled={searchLoading}>
                {searchLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Search B2B Buses</span>
                  </>
                )}
              </button>
            </form>

            {/* Results List */}
            <div className="agent-buses-list">
              {searchLoading ? (
                <div className="agent-loading-state">
                  <div className="agent-spinner"></div>
                  <p>Querying live Mantis Technologies inventory & calculating agent margins...</p>
                </div>
              ) : searchError ? (
                <div className="agent-error-banner" role="alert">
                  {searchError}
                </div>
              ) : buses.length === 0 && hasSearched ? (
                <div className="agent-empty-state">
                  <p>No live buses found for this route and date.</p>
                </div>
              ) : (
                buses.map((bus) => {
                  const grossFare = Number(bus.fare || 100);
                  const commPct = Number(currentAgent.commissionPct || 10);
                  const commAmt = Math.round(grossFare * (commPct / 100));
                  const netPayable = grossFare - commAmt;

                  return (
                    <div key={bus.id} className="agent-bus-card">
                      <div className="bus-operator-col">
                        <span className="live-gds-tag">● Mantis Live GDS</span>
                        <h4 className="bus-op-name">{bus.operator}</h4>
                        <span className="bus-type-lbl">{bus.busType}</span>
                      </div>

                      <div className="bus-timing-col">
                        <div className="time-block">
                          <strong>{bus.departureTime}</strong>
                          <span>{fromCity}</span>
                        </div>
                        <div className="arrow-block">
                          <span className="dur-lbl">{bus.duration}</span>
                          <span className="arrow-line">➔</span>
                        </div>
                        <div className="time-block">
                          <strong>{bus.arrivalTime}</strong>
                          <span>{toCity}</span>
                        </div>
                      </div>

                      {/* Explicit Agent Commission Breakdown */}
                      <div className="agent-margin-col">
                        <div className="margin-row">
                          <span className="lbl">Base Fare From:</span>
                          <span className="val">₹{grossFare}</span>
                        </div>
                        <div className="margin-row comm-highlight">
                          <span className="lbl">Your Commission ({commPct}%):</span>
                          <span className="val text-green">+ ₹{commAmt}</span>
                        </div>
                        <div className="margin-row net-row">
                          <span className="lbl">Net Deducted from Wallet:</span>
                          <strong className="val text-gold">₹{netPayable}</strong>
                        </div>
                      </div>

                      <div className="bus-action-col">
                        <span className="seats-avail-tag">{bus.availableSeats} Seats Left</span>
                        <button
                          type="button"
                          className="btn-agent-book"
                          onClick={() => handleOpenBookModal(bus)}
                        >
                          <span>Issue Ticket</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AGENT TICKET MANIFEST (LEDGER) */}
        {activeTab === "ledger" && (
          <div className="agent-section-card">
            <div className="card-top-header">
              <div>
                <h3 className="card-headline">Issued Tickets & Commission Ledger</h3>
                <p className="card-subtext">All bookings booked under {currentAgent.agencyName} ({currentAgent.agentCode}).</p>
              </div>
            </div>

            <div className="ledger-table-wrap">
              <table className="agent-ledger-table">
                <thead>
                  <tr>
                    <th>PNR & Ticket</th>
                    <th>Customer Name</th>
                    <th>Route & Date</th>
                    <th>Gross Fare</th>
                    <th>Agent Profit</th>
                    <th>Net Wallet Debit</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.map((bk, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong className="pnr-text">{bk.pnr}</strong>
                        <div className="tkt-sub">{bk.ticketNo}</div>
                      </td>
                      <td>
                        <strong>{bk.customerName}</strong>
                        <div className="phone-sub">{bk.customerPhone}</div>
                      </td>
                      <td>
                        <div>{bk.route}</div>
                        <div className="date-sub">{bk.travelDate} ({bk.departureTime})</div>
                      </td>
                      <td>₹{bk.grossFare}</td>
                      <td><strong className="text-green">+₹{bk.commissionAmt}</strong></td>
                      <td><strong>₹{bk.netPayable}</strong></td>
                      <td>
                        <span className="status-confirmed-tag">✓ Confirmed</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-print-sm"
                          onClick={() => {
                            window.open(`/pnr-status?pnr=${bk.pnr}&ticketNo=${bk.ticketNo}`, "_blank");
                          }}
                        >
                          <Printer size={13} /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEPOSIT & WALLET */}
        {activeTab === "wallet" && (
          <div className="agent-section-card">
            <div className="card-top-header">
              <div>
                <h3 className="card-headline">Mantis GDS Agent Wallet & Pre-Funded Balance</h3>
                <p className="card-subtext">Manage credits for ticketing transactions across 3,900+ bus operators.</p>
              </div>
            </div>

            <div className="wallet-overview-grid">
              <div className="wallet-balance-box">
                <span className="wallet-lbl">AVAILABLE MANTIS TRANSACTIONS BALANCE</span>
                <h2 className="wallet-num">₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                <span className="wallet-note">Directly synchronized with Mantis Technologies /ota/balance</span>

                <div className="topup-form-inline">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    step="1000"
                    min="1000"
                  />
                  <button type="button" className="btn-topup-wallet" onClick={handleTopup}>
                    <Plus size={16} /> Top-Up Wallet
                  </button>
                </div>

                {topupSuccess && (
                  <span className="topup-success-note">✓ Wallet credited successfully! Ready for instant booking.</span>
                )}
              </div>

              <div className="wallet-rules-box">
                <h4>Partner Wallet Rules & Benefits:</h4>
                <ul>
                  <li>⚡ <strong>Zero Latency:</strong> Bookings execute in under 400ms without payment gateway wait time.</li>
                  <li>💵 <strong>Automatic Net Settlement:</strong> Your commission ({currentAgent.commissionPct}%) is retained upfront; only net fare is deducted.</li>
                  <li>🔄 <strong>Instant Cancellation Refunds:</strong> Operator refund amount automatically credits back into this wallet.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AGENCY KYC & PROFILE */}
        {activeTab === "profile" && (
          <div className="agent-section-card">
            <div className="card-top-header">
              <div>
                <h3 className="card-headline">Verified Agency KYC & Credentials</h3>
                <p className="card-subtext">Verified business registration details on AIBus Partner Network.</p>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="lbl">AGENCY / TRADE NAME</span>
                <strong>{currentAgent.agencyName}</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">UNIQUE AGENT CODE</span>
                <strong className="text-gold">{currentAgent.agentCode}</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">AUTHORIZED CONTACT</span>
                <strong>{currentAgent.ownerName}</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">CONTACT PHONE</span>
                <strong>{currentAgent.mobile}</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">REGISTERED EMAIL</span>
                <strong>{currentAgent.email}</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">COMMISSION SLAB</span>
                <strong className="text-green">{currentAgent.commissionPct}% Guaranteed Margin</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">STATUTORY GSTIN</span>
                <strong>{currentAgent.gstin}</strong>
              </div>
              <div className="detail-item">
                <span className="lbl">INCOME TAX PAN</span>
                <strong>{currentAgent.pan}</strong>
              </div>
              <div className="detail-item full-width">
                <span className="lbl">REGISTERED AGENCY ADDRESS</span>
                <strong>{currentAgent.address}, {currentAgent.city}, {currentAgent.state}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingBus && (
        <div className="agent-modal-overlay" onClick={() => !bookingInProgress && setBookingBus(null)}>
          <div className="agent-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="agent-modal-header">
              <div>
                <span className="modal-top-tag">ISSUE B2B BUS TICKET</span>
                <h3>{bookingBus.operator}</h3>
                <span className="modal-sub">{fromCity} ➔ {toCity} • {travelDate}</span>
              </div>
            </div>

            <div className="agent-modal-body">
              <div className="passenger-input-group">
                <label>Passenger Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="passenger-input-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(e.target.value)}
                  />
                </div>
                <div className="passenger-input-group">
                  <label>Gender *</label>
                  <select
                    value={passengerGender}
                    onChange={(e) => setPassengerGender(e.target.value)}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              <div className="passenger-input-group">
                <label>Customer Mobile Number (For Ticket SMS) *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  required
                />
              </div>

              {/* Live seat chart of this bus */}
              <div className="passenger-input-group">
                <label>Seat *</label>
                <select
                  value={selectedSeat}
                  onChange={(e) => setSelectedSeat(e.target.value)}
                  disabled={detailsLoading || !busDetails}
                >
                  <option value="">
                    {detailsLoading
                      ? "Loading live seat chart..."
                      : `Select a seat (${availableSeats.length} available)`}
                  </option>
                  {availableSeats.map((seat) => (
                    <option key={seat.seatNumber} value={seat.seatNumber}>
                      {`Seat ${seat.seatNumber} · ₹${seat.fare}`}
                      {(busDetails?.decks || []).length > 1 ? ` · ${seat.deck === "UPPER" ? "Upper" : "Lower"}` : ""}
                      {seat.reservedFor === "FEMALE" ? " · Ladies only" : ""}
                      {seat.reservedFor === "MALE" ? " · Gents only" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-points-grid">
                <div className="passenger-input-group">
                  <label>Boarding Point *</label>
                  <select value={pickupId} onChange={(e) => setPickupId(e.target.value)} disabled={!busDetails}>
                    {(busDetails?.boardingPoints || []).map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.time ? `${point.time} · ${point.name}` : point.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="passenger-input-group">
                  <label>Dropping Point *</label>
                  <select value={dropoffId} onChange={(e) => setDropoffId(e.target.value)} disabled={!busDetails}>
                    {(busDetails?.droppingPoints || []).map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.time ? `${point.time} · ${point.name}` : point.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Commission calculation preview */}
              <div className="modal-fare-calc-box">
                <div className="calc-line">
                  <span>Customer Ticket Fare (incl. taxes):</span>
                  <strong>₹{modalFare}</strong>
                </div>
                <div className="calc-line">
                  <span>Agency Commission ({currentAgent.commissionPct}%):</span>
                  <strong className="text-green">+₹{modalCommission}</strong>
                </div>
                <div className="calc-line total-net">
                  <span>Deduction from Agent Wallet:</span>
                  <strong className="text-gold">₹{modalFare - modalCommission}</strong>
                </div>
              </div>

              {bookingError && (
                <div className="agent-error-banner" role="alert">
                  {bookingError}
                </div>
              )}

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-agent-submit"
                  onClick={handleConfirmAgentBooking}
                  disabled={bookingInProgress || detailsLoading || !busDetails}
                >
                  {bookingInProgress ? "Booking with operator..." : "Confirm & Issue Ticket"}
                </button>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  disabled={bookingInProgress}
                  onClick={() => setBookingBus(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {bookingSuccessModal && (
        <div className="agent-modal-overlay" onClick={() => setBookingSuccessModal(null)}>
          <div className="agent-modal-container success" onClick={(e) => e.stopPropagation()}>
            <div className="success-header-badge">
              <CheckCircle2 size={44} className="text-green" />
              <h3>Ticket Issued Successfully!</h3>
              <p>
                Operator PNR: <strong>{bookingSuccessModal.pnr}</strong> · Ticket No:{" "}
                <strong>{bookingSuccessModal.ticketNo}</strong>
              </p>
            </div>

            <div className="ticket-summary-pill">
              <div>
                <span>Passenger:</span>
                <strong>{bookingSuccessModal.customerName}</strong>
              </div>
              <div>
                <span>Seats:</span>
                <strong>{bookingSuccessModal.seats}</strong>
              </div>
              <div>
                <span>Commission Earned:</span>
                <strong className="text-green">+₹{bookingSuccessModal.commissionAmt}</strong>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-agent-submit"
                onClick={() => {
                  window.open(
                    `${CUSTOMER_APP_URL}/pnr-status?pnr=${encodeURIComponent(bookingSuccessModal.pnr)}&ticketNo=${encodeURIComponent(bookingSuccessModal.ticketNo)}`,
                    "_blank",
                    "noopener"
                  );
                  setBookingSuccessModal(null);
                }}
              >
                <Printer size={16} /> Print Branded Boarding Pass
              </button>
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setBookingSuccessModal(null)}
              >
                Close & Next Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AgentDashboard;
