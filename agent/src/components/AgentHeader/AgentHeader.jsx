import { Link } from "react-router-dom";
import { Bus, Briefcase } from "lucide-react";
import "./AgentHeader.css";

// Customer booking site, which runs as a separate app
const CUSTOMER_APP_URL = (import.meta.env.VITE_CUSTOMER_APP_URL || "http://localhost:5173").replace(/\/$/, "");

function AgentHeader() {
  return (
    <header className="agent-header">
      <div className="agent-header-container">
        <Link to="/" className="agent-header-logo" aria-label="AIBus Partner Home">
          <span className="agent-header-logo-icon">
            <Bus size={20} />
          </span>
          <span className="agent-header-logo-text">
            <span className="agent-header-logo-gold">AI</span>BUS
            <span className="agent-header-badge">
              <Briefcase size={11} />
              PARTNER
            </span>
          </span>
        </Link>

        <nav className="agent-header-nav">
          <a href={CUSTOMER_APP_URL} className="agent-header-link">
            Book as Customer
          </a>
          <Link to="/login" className="agent-header-login">
            Agent Login
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default AgentHeader;
