import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SearchBox from "../../components/SearchBox/SearchBox";
import FilterPanel from "../../components/FilterPanel/FilterPanel";
import SortControl from "../../components/SortControl/SortControl";
import BusList from "../../components/BusList/BusList";
import busService from "../../services/busService";
import filterBuses from "../../utils/filterBuses";
import "./SearchResults.css";

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    acOnly: false,
    nonAcOnly: false,
    sleeperOnly: false,
    seaterOnly: false,
    depTime: [],
    maxPrice: 2000,
  });

  const [sortBy, setSortBy] = useState("departure_asc");
  const [busesForRoute, setBusesForRoute] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  useEffect(() => {
    if (!from || !to || !date) {
      navigate("/");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    busService
      .searchBuses({ from, to, date })
      .then((results) => {
        if (isMounted) {
          setBusesForRoute(results);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load buses. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [from, to, date, navigate]);

  const handleInPageSearch = ({ from: newFrom, to: newTo, date: newDate }) => {
    setSearchParams({
      from: newFrom,
      to: newTo,
      date: newDate,
    });
  };

  // Compute filtered & sorted buses from the fetched route buses
  const filteredBuses = useMemo(() => {
    return filterBuses(busesForRoute, filters, sortBy);
  }, [busesForRoute, filters, sortBy]);

  const [showModifySearch, setShowModifySearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount =
    (filters.acOnly ? 1 : 0) +
    (filters.nonAcOnly ? 1 : 0) +
    (filters.sleeperOnly ? 1 : 0) +
    (filters.seaterOnly ? 1 : 0) +
    (filters.depTime && filters.depTime.length ? filters.depTime.length : 0);

  const toggleChipFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getSortLabel = (val) => {
    switch (val) {
      case "price_asc":
        return "Price: Low to High";
      case "price_desc":
        return "Price: High to Low";
      case "duration_asc":
        return "Fastest";
      case "rating_desc":
        return "Top Rated";
      case "departure_asc":
      default:
        return "Earliest";
    }
  };

  const cycleSort = () => {
    const options = ["departure_asc", "price_asc", "rating_desc", "duration_asc"];
    const currIdx = options.indexOf(sortBy);
    const nextIdx = (currIdx + 1) % options.length;
    setSortBy(options[nextIdx]);
  };

  return (
    <main className="search-results-page">
      <div className="search-results-container">
        {/* ========================================================
            MOBILE STICKY ROUTE SUMMARY BAR (< 860px)
           ======================================================== */}
        <div className="mobile-route-summary-bar">
          <button
            type="button"
            className="mobile-back-btn"
            onClick={() => navigate("/")}
            aria-label="Back to home"
          >
            ←
          </button>

          <div
            className="mobile-route-info"
            onClick={() => setShowModifySearch((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <div className="mobile-cities">
              <strong>{from}</strong>
              <span className="route-arrow">➔</span>
              <strong>{to}</strong>
            </div>
            <div className="mobile-date-count">
              <span>{date}</span>
              <span className="dot-sep">•</span>
              <span>{loading ? "Searching..." : `${filteredBuses.length} buses`}</span>
            </div>
          </div>

          <button
            type="button"
            className={`mobile-modify-toggle-btn ${showModifySearch ? "open" : ""}`}
            onClick={() => setShowModifySearch((prev) => !prev)}
          >
            {showModifySearch ? "✕ Close" : "✏️ Modify"}
          </button>
        </div>

        {/* Collapsible Search Box on Mobile */}
        {showModifySearch && (
          <div className="mobile-search-dropdown-wrapper">
            <SearchBox
              initialFrom={from}
              initialTo={to}
              initialDate={date}
              onSearch={(params) => {
                handleInPageSearch(params);
                setShowModifySearch(false);
              }}
            />
          </div>
        )}

        {/* ========================================================
            DESKTOP HEADER & HORIZONTAL SEARCH BAR (>= 860px)
           ======================================================== */}
        <div className="desktop-results-header-bar">
          <div className="header-text-block">
            <h1 className="page-title">Available Buses</h1>
            <p className="results-count-text">
              {loading
                ? "Searching buses..."
                : `${filteredBuses.length} ${
                    filteredBuses.length === 1 ? "bus" : "buses"
                  } found for your journey`}
            </p>
          </div>
        </div>

        <div className="desktop-search-bar-wrapper">
          <SearchBox
            initialFrom={from}
            initialTo={to}
            initialDate={date}
            onSearch={handleInPageSearch}
          />
        </div>

        {/* ========================================================
            MOBILE QUICK FILTER & SORT CHIPS ROW
           ======================================================== */}
        <div className="mobile-quick-chips-bar">
          <button
            type="button"
            className={`quick-chip filter-main-chip ${activeFilterCount > 0 ? "active" : ""}`}
            onClick={() => setShowMobileFilters(true)}
          >
            <span>⚡ Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
          </button>

          <button
            type="button"
            className="quick-chip sort-chip"
            onClick={cycleSort}
            title="Click to cycle sorting"
          >
            <span>⇅ {getSortLabel(sortBy)}</span>
          </button>

          <button
            type="button"
            className={`quick-chip toggle-chip ${filters.acOnly ? "active" : ""}`}
            onClick={() => toggleChipFilter("acOnly")}
          >
            AC
          </button>

          <button
            type="button"
            className={`quick-chip toggle-chip ${filters.sleeperOnly ? "active" : ""}`}
            onClick={() => toggleChipFilter("sleeperOnly")}
          >
            Sleeper
          </button>

          <button
            type="button"
            className={`quick-chip toggle-chip ${filters.seaterOnly ? "active" : ""}`}
            onClick={() => toggleChipFilter("seaterOnly")}
          >
            Seater
          </button>

          <button
            type="button"
            className={`quick-chip toggle-chip ${filters.nonAcOnly ? "active" : ""}`}
            onClick={() => toggleChipFilter("nonAcOnly")}
          >
            Non-AC
          </button>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="search-loading-state" style={{ padding: "40px", textAlign: "center" }}>
            <div className="loading-spinner" style={{ fontSize: "1.2rem", color: "#666" }}>
              ⏳ Loading available buses from {from} to {to}...
            </div>
          </div>
        ) : error ? (
          <div className="no-buses-card" style={{ marginTop: "20px" }}>
            <div className="no-buses-icon">⚠️</div>
            <h2>Unable to load buses</h2>
            <p>{error}</p>
          </div>
        ) : (
          /* Main 2-Column Layout */
          <div className="search-results-layout">
            {/* Desktop Left Column: Filter Sidebar */}
            <div className="desktop-filter-sidebar">
              <FilterPanel
                buses={busesForRoute}
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>

            {/* Mobile Filter Bottom Sheet Drawer */}
            {showMobileFilters && (
              <>
                <div
                  className="filter-mobile-backdrop"
                  onClick={() => setShowMobileFilters(false)}
                />
                <div className="filter-mobile-drawer">
                  <div className="drawer-grab-bar" />
                  <div className="drawer-header">
                    <h3>Filter Buses</h3>
                    <button
                      type="button"
                      className="drawer-close-btn"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="drawer-body">
                    <FilterPanel
                      buses={busesForRoute}
                      filters={filters}
                      onFilterChange={setFilters}
                    />
                  </div>
                  <div className="drawer-footer">
                    <button
                      type="button"
                      className="drawer-apply-btn"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Apply Filters ({filteredBuses.length} Buses)
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Right Column: Sort & Bus List */}
            <div className="results-content-area">
              <div className="desktop-sort-wrapper">
                <SortControl value={sortBy} onChange={setSortBy} />
              </div>

              {filteredBuses.length > 0 ? (
                <BusList
                  buses={filteredBuses}
                  searchFrom={from}
                  searchTo={to}
                  searchDate={date}
                />
              ) : (
                <div className="no-buses-card">
                  <div className="no-buses-icon">🚌</div>
                  <h2>No buses found</h2>
                  <p>Try changing your search date or clearing your filters to see more results.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default SearchResults;