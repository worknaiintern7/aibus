import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LocationInput from "../LocationInput/LocationInput";
import DateInput from "../DateInput/DateInput";
import "./SearchBox.css";

function SearchBox({ initialFrom = "", initialTo = "", initialDate = "", onSearch }) {
  const navigate = useNavigate();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
    if (initialTo) setTo(initialTo);
    if (initialDate) setDate(initialDate);
  }, [initialFrom, initialTo, initialDate]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setError("");
  };

  const handleSearch = () => {
    if (!from) {
      setError("Please enter a departure city.");
      return;
    }
    if (!to) {
      setError("Please select your arrival city.");
      return;
    }

    if (from.toLowerCase().trim() === to.toLowerCase().trim()) {
      setError("Departure and arrival cities cannot be the same.");
      return;
    }

    if (!date) {
      setError("Please select a journey date.");
      return;
    }

    setError("");

    if (onSearch) {
      onSearch({ from: from.trim(), to: to.trim(), date });
    } else {
      const params = new URLSearchParams({
        from: from.trim(),
        to: to.trim(),
        date,
      });

      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="search-box">
      <div className="search-box-inputs">
        <LocationInput
          label="FROM"
          placeholder="Departure city"
          value={from}
          onChange={(val) => {
            setFrom(val);
            if (error) setError("");
          }}
          disabledCity={to}
        />

        <button
          type="button"
          className="swap-button"
          aria-label="Swap departure and arrival cities"
          onClick={handleSwap}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="17 1 21 5 17 9" />
            <line x1="3" y1="5" x2="21" y2="5" />
            <polyline points="7 23 3 19 7 15" />
            <line x1="21" y1="19" x2="3" y2="19" />
          </svg>
        </button>

        <LocationInput
          label="TO"
          placeholder="Arrival city"
          value={to}
          onChange={(val) => {
            setTo(val);
            if (error) setError("");
          }}
          disabledCity={from}
        />

        <DateInput value={date} onChange={setDate} />

        <button
          type="button"
          className="search-button"
          onClick={handleSearch}
        >
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search Buses
        </button>
      </div>

      {error && <p className="search-error">{error}</p>}
    </div>
  );
}

export default SearchBox;