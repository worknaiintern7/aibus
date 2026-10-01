import SearchBox from "../../components/SearchBox/SearchBox";
import PopularOffers from "../../components/PopularOffers/PopularOffers";
import heroBusImg from "../../assets/hero-bus.jpg";
import { Sparkles, ShieldCheck, Zap, Globe2 } from "lucide-react";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      {/* ================================
          HERO SECTION WITH LUXURY BUS
      ================================= */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBusImg})` }}
      >
        <div className="hero-overlay">
          <div className="hero-container">
            <div className="hero-left-content">
              <div className="hero-eyebrow">
                <span className="eyebrow-ai-pill">
                  <Sparkles size={13} className="ai-sparkle-icon" />
                  Smart Intercity Travel
                </span>
              </div>

              <h1 className="hero-title">
                Comfortable Journeys. <br />
                <span className="text-gold">Effortless Booking.</span>
              </h1>

              <p className="hero-subtitle">
                Real-time seat inventory, verified bus operators, and instant confirmed tickets across India.
              </p>
            </div>

            {/* Search Box directly inside hero container */}
            <div className="search-box-hero-wrapper">
              <SearchBox />
            </div>

            {/* AI Trust & Live Inventory Bar */}
            <div className="hero-ai-features-strip">
              <div className="ai-feature-pill">
                <Zap size={16} className="feature-icon" />
                <span>Live Seat Availability</span>
              </div>
              <div className="ai-feature-pill">
                <Sparkles size={16} className="feature-icon" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="ai-feature-pill">
                <ShieldCheck size={16} className="feature-icon" />
                <span>Instant Ticket Issuance</span>
              </div>
              <div className="ai-feature-pill">
                <Globe2 size={16} className="feature-icon" />
                <span>Verified Operators</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
          OFFERS & MORE SECTION
      ================================= */}
      <PopularOffers />
    </main>
  );
}

export default Home;