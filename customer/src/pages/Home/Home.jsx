import SearchBox from "../../components/SearchBox/SearchBox";
import PopularOffers from "../../components/PopularOffers/PopularOffers";
import heroBusImg from "../../assets/hero-bus.jpg";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      {/* ================================
          HERO SECTION WITH SCENIC BUS
      ================================= */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroBusImg})` }}
      >
        <div className="hero-overlay">
          <div className="hero-container">
            <div className="hero-left-content">
              <div className="hero-eyebrow">
                <span>JOURNEYS CONNECT PEOPLE</span>
                <span className="eyebrow-line"></span>
              </div>

              <h1 className="hero-title">
                Book Your <br />
                <span className="text-red">Bus Journey</span>
              </h1>

              <p className="hero-subtitle">
                Search buses and book your journey with ease.
              </p>

              {/* Glassmorphic Feature Highlights Pill */}
              <div className="hero-features-pill">
                <div className="feature-item">
                  <div className="feature-icon-wrapper red">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <strong>Safe & Secure</strong>
                    <span>Your safety our priority</span>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="7" y="5" width="10" height="14" rx="2" />
                      <path d="M5 19v2" />
                      <path d="M19 19v2" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <strong>Wide Range</strong>
                    <span>AC, Non-AC, Sleeper & Seater</span>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <circle cx="7" cy="7" r="1" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <strong>Best Prices</strong>
                    <span>Great deals always</span>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div className="feature-text">
                    <strong>24/7 Support</strong>
                    <span>We're here for you</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Box directly inside hero container */}
            <div className="search-box-hero-wrapper">
              <SearchBox />
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