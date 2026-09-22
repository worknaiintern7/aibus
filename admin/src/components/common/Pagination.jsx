import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export const Pagination = ({
  pageNumber = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div>
        Showing page <span style={{ color: "var(--admin-text-main)", fontWeight: "600" }}>{pageNumber + 1}</span> of{" "}
        <span style={{ color: "var(--admin-text-main)", fontWeight: "600" }}>{totalPages}</span> ({totalElements} total items)
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button
          variant="outline"
          size="sm"
          disabled={pageNumber <= 0}
          onClick={() => onPageChange(pageNumber - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pageNumber >= totalPages - 1}
          onClick={() => onPageChange(pageNumber + 1)}
          icon={ChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
