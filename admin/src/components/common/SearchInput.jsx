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
    <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--admin-text-muted)",
        }}
      />
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleTextChange}
        style={{ paddingLeft: "2.4rem", paddingRight: searchTerm ? "2.2rem" : "0.9rem" }}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          style={{
            position: "absolute",
            right: "0.6rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--admin-text-muted)",
            cursor: "pointer",
            padding: "0.2rem",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
