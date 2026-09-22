import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import busService from "../../services/busService";
import bookingService from "../../services/bookingService";
import authService from "../../services/authService";
import BookingStepper from "../../components/BookingStepper/BookingStepper";
import "./TravellerDetails.css";

function formatTripDate(dateStr) {
  if (!dateStr) return "Tue, 17 Sep 2026";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function TravellerDetails() {
  const loggedInUser = authService.getLoggedInUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const busId = searchParams.get("busId") || "1";
  const seatsParam = searchParams.get("seats") || "8D, 9D";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const selectedSeats = seatsParam ? seatsParam.split(",").map((s) => s.trim()) : ["8D", "9D"];

  useEffect(() => {
    let isMounted = true;
    busService
      .getBusById(busId, { from, to, date })
      .then((bus) => {
        if (isMounted) {
          setSelectedBus(bus);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching bus details:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [busId, from, to, date]);

  // Automatically generate passenger forms = selectedSeats.length
  const [travellers, setTravellers] = useState(() =>
    selectedSeats.map((seat, index) => ({
      seat,
      name: index === 0 && loggedInUser?.name ? loggedInUser.name : "",
      age: "",
      gender: "Male",
    }))
  );

  const [contactMobile, setContactMobile] = useState(
    loggedInUser?.mobile || ""
  );

  const [error, setError] = useState("");

  // ⏱️ 5-Minute Seat Lock Timer Logic
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const activeLock = bookingService.getSeatLock();
    if (!activeLock) {
      bookingService.lockSeats(busId, selectedSeats, { from, to, date });
    }

    const timer = setInterval(() => {
      const currentLock = bookingService.getSeatLock();
      if (!currentLock) {
        clearInterval(timer);
        alert("Your 5-minute seat lock timer expired. Please select your seats again.");
        navigate(`/seat-selection?busId=${busId}&from=${from || ""}&to=${to || ""}&date=${date || ""}`);
        return;
      }

      const secondsRemaining = Math.max(
        0,
        Math.floor((currentLock.expiresAt - Date.now()) / 1000)
      );

      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) {
        clearInterval(timer);
        bookingService.clearSeatLock();
        alert("Your 5-minute seat lock timer expired. Please select your seats again.");
        navigate(`/seat-selection?busId=${busId}&from=${from || ""}&to=${to || ""}&date=${date || ""}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [busId, from, to, date, navigate, selectedSeats]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <main className="traveller-details-page">
        <div className="traveller-details-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "1.2rem", color: "#666" }}>
            ⏳ Loading journey details...
          </div>
        </div>
      </main>
    );
  }

  if (!selectedBus) {
    return (
      <main className="traveller-details-page">
        <div className="traveller-details-container">
          <button
            type="button"
            className="subtle-back-link"
            onClick={() => navigate(-1)}
          >
            ← Back to Seat Selection
          </button>
          <div className="not-found-card">
            <h1>Bus Route Not Found</h1>
            <p>Please select a valid bus route from search results.</p>
          </div>
        </div>
      </main>
    );
  }

  const handleTravellerChange = (index, field, value) => {
    let updatedValue = value;

    // Strict input filtering based on field type
    if (field === "name") {
      // Allow only letters and spaces, max 50 chars
      updatedValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50);
    } else if (field === "age") {
      // Allow only numeric digits, max 3 digits
      updatedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    const updated = [...travellers];
    updated[index] = {
      ...updated[index],
      [field]: updatedValue,
    };
    setTravellers(updated);
    setError("");
  };

  // Helper validation checkers
  const isValidName = (name) => /^[a-zA-Z\s]{2,50}$/.test(name.trim());
  const isValidAge = (age) => {
    const num = Number(age);
    return !isNaN(num) && num >= 1 && num <= 120;
  };
  const isValidMobile = (mob) => /^[6-9]\d{9}$/.test(mob);

  const isFormValid =
    travellers.every((t) => isValidName(t.name) && isValidAge(t.age)) &&
    isValidMobile(contactMobile);

  const handleContinue = () => {
    // Validate each passenger
    for (let i = 0; i < travellers.length; i++) {
      const p = travellers[i];
      if (!p.name.trim()) {
        setError(`Please enter Full Name for Passenger ${i + 1} (Seat ${p.seat}).`);
        return;
      }

      if (!isValidName(p.name)) {
        setError(`Passenger ${i + 1} name must contain only alphabets (min 2 characters).`);
        return;
      }

      if (!p.age.toString().trim()) {
        setError(`Please enter Age for Passenger ${i + 1} (Seat ${p.seat}).`);
        return;
      }

      if (!isValidAge(p.age)) {
        setError(`Please enter a valid age (1-120) for Passenger ${i + 1}.`);
        return;
      }
    }

    if (!contactMobile.trim()) {
      setError("Please enter primary mobile number.");
      return;
    }

    if (!isValidMobile(contactMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      return;
    }

    setError("");

    const params = new URLSearchParams({
      busId: selectedBus.id,
      seats: selectedSeats.join(","),
      travellersData: JSON.stringify(travellers),
      contactMobile,
      ...(selectedBus.from && { from: selectedBus.from }),
      ...(selectedBus.to && { to: selectedBus.to }),
      ...(selectedBus.date && { date: selectedBus.date }),
    });

    navigate(`/booking-confirmation?${params.toString()}`);
  };

  const displayFrom = from || selectedBus.from || "Bengaluru";
  const displayTo = to || selectedBus.to || "Pune";
  const displayDate = formatTripDate(date || selectedBus.date);
  const totalFare = selectedSeats.length * selectedBus.price;

  return (
    <main className="traveller-details-page">
      <div className="traveller-details-container">
        {/* Compact Booking Stepper (Step 2: Traveller Details Active) */}
        <BookingStepper currentStep={2} />

        {/* 2-Column Desktop Grid Layout */}
        <div className="traveller-details-grid">
          {/* LEFT COLUMN: Passenger Forms & Contact Info (~68-70%) */}
          <div className="traveller-forms-column">
            {/* Subtle Back Link Above Heading */}
            <button
              type="button"
              className="subtle-back-link"
              onClick={() => navigate(-1)}
            >
              ← Back to Seat Selection
            </button>

            {/* Page Heading Block */}
            <div className="traveller-heading-block">
              <h1 className="page-title">Traveller Details</h1>
              <p className="page-subtext">Enter passenger details to continue</p>
            </div>

            {/* Dynamically Generated Passenger Cards = selectedSeats.length */}
            <div className="passenger-cards-list">
              {travellers.map((passenger, idx) => {
                const nameHasErr = passenger.name.length > 0 && !isValidName(passenger.name);
                const ageHasErr = passenger.age.length > 0 && !isValidAge(passenger.age);

                return (
                  <div key={passenger.seat} className="passenger-card">
                    <div className="passenger-card-header">
                      <h3 className="passenger-title">Passenger {idx + 1}</h3>
                      <span className="passenger-seat-badge">Seat {passenger.seat}</span>
                    </div>

                    <div className="card-form-body">
                      {/* Full Name Field (100% width) */}
                      <div className="form-group full-width">
                        <label htmlFor={`name-${idx}`}>Full Name</label>
                        <input
                          id={`name-${idx}`}
                          type="text"
                          maxLength="50"
                          placeholder="Enter full name (as per ID)"
                          value={passenger.name}
                          className={nameHasErr ? "input-error" : ""}
                          onChange={(e) =>
                            handleTravellerChange(idx, "name", e.target.value)
                          }
                        />
                        {nameHasErr && (
                          <span className="field-error-text">
                            Name must be at least 2 letters (alphabets only)
                          </span>
                        )}
                      </div>

                      {/* Age + Gender Segmented Control Row */}
                      <div className="form-grid-row">
                        <div className="form-group age-group">
                          <label htmlFor={`age-${idx}`}>Age</label>
                          <input
                            id={`age-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength="3"
                            placeholder="Enter age"
                            value={passenger.age}
                            className={ageHasErr ? "input-error" : ""}
                            onChange={(e) =>
                              handleTravellerChange(idx, "age", e.target.value)
                            }
                          />
                          {ageHasErr && (
                            <span className="field-error-text">Age must be 1 - 120</span>
                          )}
                        </div>

                        <div className="form-group gender-group">
                          <label>Gender</label>
                          <div className="gender-segmented-control">
                            {["Male", "Female", "Other"].map((g) => (
                              <button
                                key={g}
                                type="button"
                                className={`gender-tab-btn ${
                                  passenger.gender === g ? "selected" : ""
                                }`}
                                onClick={() =>
                                  handleTravellerChange(idx, "gender", g)
                                }
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact Information Card */}
            <div className="contact-info-card">
              <h3 className="contact-card-title">Contact Information</h3>
              <p className="contact-card-subtext">
                Booking confirmation will be sent to this number.
              </p>

              <div className="form-group full-width">
                <label htmlFor="contact-mobile">Mobile Number</label>
                <div
                  className={`mobile-prefix-input-wrapper ${
                    contactMobile.length > 0 && !isValidMobile(contactMobile)
                      ? "input-error"
                      : ""
                  }`}
                >
                  <span className="country-prefix">+91</span>
                  <div className="input-divider" />
                  <input
                    id="contact-mobile"
                    type="tel"
                    maxLength="10"
                    placeholder="Enter mobile number"
                    value={contactMobile}
                    onChange={(e) => {
                      setContactMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError("");
                    }}
                  />
                </div>
                {contactMobile.length > 0 && !isValidMobile(contactMobile) && (
                  <span className="field-error-text">
                    Enter valid 10-digit mobile number (starts with 6-9)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Single Compact Trip Summary Card (~30-32%, Sticky Desktop) */}
          <div className="trip-summary-column">
            <div className="sidebar-trip-summary-card">
              <h3 className="summary-card-title">Trip Summary</h3>

              {/* Operator & Bus Type Header */}
              <div className="summary-bus-header">
                <div className="bus-text-info">
                  <strong className="summary-operator-name">{selectedBus.operator}</strong>
                  <span className="summary-bus-type">{selectedBus.busType}</span>
                </div>
              </div>

              {/* Timeline Row */}
              <div className="summary-timeline-row">
                <div className="time-block dep">
                  <strong className="time-val">{selectedBus.departureTime}</strong>
                  <span className="city-lbl">{displayFrom}</span>
                </div>
                <div className="duration-line-block">
                  <span className="duration-lbl">{selectedBus.duration}</span>
                  <div className="line-dots-bar">
                    <span className="line-dot" />
                    <div className="line-fill" />
                    <span className="line-dot" />
                  </div>
                </div>
                <div className="time-block arr">
                  <strong className="time-val">{selectedBus.arrivalTime}</strong>
                  <span className="city-lbl">{displayTo}</span>
                </div>
              </div>

              {/* Date & Seats Count Row */}
              <div className="summary-date-seats-row">
                <div className="date-block">
                  <span className="meta-lbl">Date</span>
                  <strong className="meta-val">{displayDate}</strong>
                </div>
                <div className="seats-count-block">
                  <span className="meta-lbl">Seats</span>
                  <strong className="meta-val">{selectedSeats.length} {selectedSeats.length === 1 ? "Seat" : "Seats"}</strong>
                </div>
              </div>

              {/* Highlighted Selected Seats Box */}
              <div className="selected-seats-highlight-box">
                <span className="box-lbl">Selected Seats</span>
                <strong className="box-seats-list">{selectedSeats.join(", ")}</strong>
              </div>

              {/* Total Fare Display */}
              <div className="summary-total-fare-row">
                <span className="total-fare-lbl">Total Fare</span>
                <strong className="total-fare-val">₹{totalFare.toLocaleString("en-IN")}</strong>
              </div>

              {/* Error Message (if any) */}
              {error && <div className="summary-error-text">{error}</div>}

              {/* ONLY PRIMARY CTA ON PAGE */}
              <button
                type="button"
                className="continue-review-cta"
                onClick={handleContinue}
              >
                <span>Continue to Review & Pay</span>
                <span className="cta-arrow">→</span>
              </button>

              {/* Seat Lock Timer Footer */}
              <div className="seats-reserved-timer-badge">
                <span className="lock-icon">🔒</span>
                <span>Your seats are reserved for </span>
                <strong className="timer-counter">{formatTimer(timeLeft)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TravellerDetails;