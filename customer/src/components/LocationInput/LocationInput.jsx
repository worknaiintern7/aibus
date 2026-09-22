import { useState, useRef, useEffect } from "react";
import cities from "../../utils/cities";
import "./LocationInput.css";

function LocationInput({ label, placeholder, value, onChange, disabledCity = "" }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(value.toLowerCase().trim())
  );

  const isCityDisabled = (city) => {
    if (!disabledCity || !city) return false;
    return city.toLowerCase().trim() === disabledCity.toLowerCase().trim();
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

  const handleChange = (event) => {
    onChange(event.target.value);
    setShowSuggestions(true);
  };

  const handleCitySelect = (city) => {
    if (isCityDisabled(city)) return;
    onChange(city);
    setShowSuggestions(false);
  };

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
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
        />

        {showSuggestions && filteredCities.length > 0 && (
          <div className="city-suggestions">
            {filteredCities.map((city) => {
              const disabled = isCityDisabled(city);

              return (
                <button
                  type="button"
                  key={city}
                  disabled={disabled}
                  className={`suggestion-item ${disabled ? "disabled-city" : ""}`}
                  onClick={() => handleCitySelect(city)}
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
                    <span>{city}</span>
                  </div>

                  {disabled && <span className="disabled-tag">Selected</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationInput;