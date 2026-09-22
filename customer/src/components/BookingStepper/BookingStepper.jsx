import "./BookingStepper.css";

function BookingStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: "Select Seats" },
    { number: 2, label: "Traveller Details" },
    { number: 3, label: "Review & Pay" },
    { number: 4, label: "Booking Confirmation" },
  ];

  return (
    <div className="booking-stepper-container">
      <div className="booking-stepper">
        {steps.map((step, idx) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="stepper-item-wrapper">
              <div
                className={`stepper-item ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
              >
                <span className="step-circle">{isCompleted ? "✓" : step.number}</span>
                <span className="step-label">{step.label}</span>
              </div>
              {idx < steps.length - 1 && <div className="stepper-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BookingStepper;
