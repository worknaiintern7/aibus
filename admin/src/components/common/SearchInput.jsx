import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export const SearchInput = ({ placeholder = "Search...", value = "", onChange }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
  };

  return (
    <div className="search-input-wrapper">
      <Search
        size={16}
        className="search-input-icon"
      />
      <input
        type="text"
        className="form-control search-input-field"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleTextChange}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="search-input-clear"
          title="Clear search"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
