// B2B agent portal: a separate app on its own port / domain
export const AGENT_PORTAL_URL = (
  import.meta.env.VITE_AGENT_PORTAL_URL || "http://localhost:5175"
).replace(/\/$/, "");

export const BUS_TYPES = [
  { label: "AC Sleeper", value: "AC_SLEEPER" },
  { label: "AC Seater", value: "AC_SEATER" },
  { label: "Non-AC Sleeper", value: "NON_AC_SLEEPER" },
  { label: "Non-AC Seater", value: "NON_AC_SEATER" },
  { label: "AC Seater Sleeper", value: "AC_SEATER_SLEEPER" },
];

export const SEAT_TYPES = [
  { label: "Lower Deck", value: "LOWER" },
  { label: "Upper Deck", value: "UPPER" },
  { label: "Single Seat", value: "SINGLE" },
  { label: "Window Seat", value: "WINDOW" },
  { label: "Aisle Seat", value: "AISLE" },
];

export const SCHEDULE_STATUSES = [
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const BOOKING_STATUSES = [
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Pending", value: "PENDING" },
];

export const PAYMENT_STATUSES = [
  { label: "Success", value: "SUCCESS" },
  { label: "Initiated", value: "INITIATED" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];
