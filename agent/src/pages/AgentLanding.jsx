import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  TrendingUp,
  Wallet,
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";
import "./AgentPortal.css";

function AgentLanding() {
  const navigate = useNavigate();

  return (
    <main className="agent-landing-page">
      <div className="agent-landing-container">
        {/* Hero Section */}
        <div className="agent-hero-banner">
          <div className="agent-tag">
            <Sparkles size={14} className="sparkle-gold" />
            <span>AIBUS B2B TRAVEL PARTNER NETWORK</span>
          </div>

          <h1 className="agent-hero-title">
            Grow Your Travel Agency with India's Largest Bus Inventory
          </h1>
          <p className="agent-hero-desc">
            Direct Mantis GDS integration with 29,393+ cities, instant ticket issuance, pre-funded high-speed wallet, and up to 16% commission on every booked seat.
          </p>

          <div className="agent-cta-group">
            <Link to="/register" className="btn-agent-primary">
              <span>Register Your Agency (KYC)</span>
              <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="btn-agent-secondary">
              <span>Agent Partner Login</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="agent-hero-stats">
            <div className="agent-stat-item">
              <strong>29,393+</strong>
              <span>Connected Cities</span>
            </div>
            <div className="agent-stat-sep"></div>
            <div className="agent-stat-item">
              <strong>Up to 16%</strong>
              <span>Direct Commission</span>
            </div>
            <div className="agent-stat-sep"></div>
            <div className="agent-stat-item">
              <strong>Instant PNR</strong>
              <span>Mantis GDS Sync</span>
            </div>
            <div className="agent-stat-sep"></div>
            <div className="agent-stat-item">
              <strong>₹0 Deposit</strong>
              <span>Flexible Starter Wallet</span>
            </div>
          </div>
        </div>

        {/* Why Partner Cards */}
        <div className="agent-features-section">
          <h2 className="section-title-center">Why Leading Travel Agents Partner with AIBus</h2>
          <p className="section-subtitle-center">Built specifically for offline travel agents, booking kiosks, and tour operators across India.</p>

          <div className="agent-features-grid">
            <div className="agent-feature-card">
              <div className="feature-icon-box">
                <TrendingUp size={24} />
              </div>
              <h3>Guaranteed Commission</h3>
              <p>Earn standard 8% to 16% commission on every live Mantis inventory seat with instant commission crediting to your account.</p>
            </div>

            <div className="agent-feature-card">
              <div className="feature-icon-box">
                <Wallet size={24} />
              </div>
              <h3>Unified Mantis Pool Wallet</h3>
              <p>Single consolidated wallet for all bookings across 3,900+ bus operators. No need to maintain individual operator balances.</p>
            </div>

            <div className="agent-feature-card">
              <div className="feature-icon-box">
                <Award size={24} />
              </div>
              <h3>Branded Agency Tickets</h3>
              <p>Print official passenger boarding passes carrying your travel agency name, logo, phone number, and GSTIN invoice.</p>
            </div>

            <div className="agent-feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h3>Fast Admin Verification</h3>
              <p>Submit your PAN, GSTIN and shop photo online. Our compliance desk approves applications within 2 to 4 hours.</p>
            </div>
          </div>
        </div>

        {/* Onboarding Steps */}
        <div className="agent-steps-card">
          <h2 className="steps-headline">Simple 3-Step Agent Onboarding</h2>
          
          <div className="steps-row">
            <div className="step-box">
              <div className="step-num">1</div>
              <h4>Submit KYC Application</h4>
              <p>Fill in agency details and upload PAN, GST certificate, and agency storefront photo.</p>
            </div>

            <div className="step-arrow">➔</div>

            <div className="step-box">
              <div className="step-num">2</div>
              <h4>Admin Review & Approval</h4>
              <p>AIBus compliance desk verifies your documents and assigns your unique Agent Code & commission slab.</p>
            </div>

            <div className="step-arrow">➔</div>

            <div className="step-box">
              <div className="step-num">3</div>
              <h4>Start Booking & Earning</h4>
              <p>Log in with your credentials, access live Mantis inventory, and earn commissions on every ticket.</p>
            </div>
          </div>

          <div className="steps-cta-center">
            <Link to="/register" className="btn-agent-primary">
              <span>Start Agent Registration</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AgentLanding;
