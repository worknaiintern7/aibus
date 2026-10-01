import { useState, useRef, useEffect, useCallback } from "react";
import busService from "../../services/busService";
import "./LocationInput.css";

// In-memory query cache across LocationInput instances for instant responses
const cityQueryCache = new Map();

function LocationInput({ label, placeholder, value, onChange, disabledCity = "" }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const fetchCities = useCallback(async (query) => {
    const q = (query || "").trim();
    if (cityQueryCache.has(q)) {
      setCitiesList(cityQueryCache.get(q));
      return;
    }

    setLoading(true);
    try {
      const results = await busService.getCities(q);
      cityQueryCache.set(q, results);
      setCitiesList(results);
    } catch (err) {
      console.warn("Error fetching GDS cities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load of default popular GDS cities
  useEffect(() => {
    fetchCities("");
  }, [fetchCities]);

  // Handle typing with debounce
  const handleInputChange = (event) => {
    const val = event.target.value;
    onChange(val);
    setShowSuggestions(true);
    setActiveIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchCities(val);
    }, 200);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    fetchCities(value);
  };

  const isCityDisabled = (cityName) => {
    if (!disabledCity || !cityName) return false;
    return cityName.toLowerCase().trim() === disabledCity.toLowerCase().trim();
  };

  const handleCitySelect = (cityName) => {
    if (isCityDisabled(cityName)) return;
    onChange(cityName);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || citiesList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < citiesList.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : citiesList.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < citiesList.length) {
        handleCitySelect(citiesList[activeIndex].city);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="location-input" ref={containerRef}>
      <label>{label}</label>

      <div className="location-input-wrapper">
        <svg
          className="input-location-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />

        {loading && (
          <div className="location-loading-spinner" aria-label="Loading cities">
            <span className="spinner-dot" />
          </div>
        )}

        {showSuggestions && (
          <div className="city-suggestions">
            <div className="suggestions-header">
              <span className="suggestions-badge">Mantis GDS API</span>
              <span className="suggestions-hint">
                {value.trim() ? "Search Results" : "Popular Destinations"}
              </span>
            </div>

            {citiesList.length === 0 && !loading ? (
              <div className="no-cities-found">
                <span>No cities found matching &quot;{value}&quot;</span>
              </div>
            ) : (
              <div className="suggestions-list">
                {citiesList.map((item, index) => {
                  const cityName = item.city;
                  const stateName = item.state;
                  const disabled = isCityDisabled(cityName);
                  const isActive = index === activeIndex;

                  return (
                    <button
                      type="button"
                      key={`${item.cityId || index}-${cityName}`}
                      disabled={disabled}
                      className={`suggestion-item ${disabled ? "disabled-city" : ""} ${
                        isActive ? "active-suggestion" : ""
                      }`}
                      onClick={() => handleCitySelect(cityName)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className="suggestion-left">
                        <svg
                          className="suggestion-pin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <div className="city-info">
                          <span className="city-name">{cityName}</span>
                          {stateName && (
                            <span className="city-state">{stateName}</span>
                          )}
                        </div>
                      </div>

                      {disabled && <span className="disabled-tag">Selected</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationInput;