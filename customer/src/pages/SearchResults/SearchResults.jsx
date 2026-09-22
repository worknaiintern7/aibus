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

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFilterCount =
    (filters.acOnly ? 1 : 0) +
    (filters.nonAcOnly ? 1 : 0) +
    (filters.sleeperOnly ? 1 : 0) +
    (filters.seaterOnly ? 1 : 0) +
    (filters.depTime && filters.depTime.length ? filters.depTime.length : 0);

  return (
    <main className="search-results-page">
      <div className="search-results-container">
        {/* Top Header Title */}
        <div className="results-header-bar">
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

        {/* Embedded Top Horizontal Search Bar */}
        <div className="search-results-search-bar-wrapper">
          <SearchBox
            initialFrom={from}
            initialTo={to}
            initialDate={date}
            onSearch={handleInPageSearch}
          />
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
            {/* Mobile Filter Toggle Button */}
            <div className="mobile-filter-toggle-row">
              <button
                type="button"
                className={`mobile-filter-toggle-btn ${showMobileFilters ? "open" : ""}`}
                onClick={() => setShowMobileFilters((prev) => !prev)}
                aria-expanded={showMobileFilters}
              >
                <span>🔍 Filter Buses {activeFilterCount > 0 ? `(${activeFilterCount} active)` : ""}</span>
                <span className="toggle-arrow">{showMobileFilters ? "▲ Close" : "▼ Filters & Price"}</span>
              </button>
            </div>

            {/* Left Column: Filter Sidebar */}
            <div className={`filter-panel-wrapper ${showMobileFilters ? "mobile-visible" : ""}`}>
              <FilterPanel
                buses={busesForRoute}
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>

            {/* Right Column: Sort & Bus List */}
            <div className="results-content-area">
              <SortControl value={sortBy} onChange={setSortBy} />

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