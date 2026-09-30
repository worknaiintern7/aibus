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