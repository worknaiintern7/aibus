import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (!otpSent || resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await authService.sendOtp(mobile);
      setOtp("");
      setOtpSent(true);
      setResendTimer(30);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await authService.sendOtp(mobile);
      setOtp("");
      setResendTimer(30);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await authService.verifyOtp(mobile, otp);

      const returnTo = searchParams.get("returnTo");

      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setResendTimer(30);
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="login-card">
          <h1 className="login-title">
            {otpSent ? "Verify OTP" : "Login"}
          </h1>

          <p className="login-subtitle">
            {otpSent
              ? `Enter the OTP sent to +91 ${mobile}`
              : "Login with your mobile number"}
          </p>

          {!otpSent ? (
            <>
              <div className="form-group">
                <label htmlFor="mobile-input">Mobile Number</label>

                <div className="mobile-input-wrapper">
                  <span className="country-code">+91</span>

                  <input
                    id="mobile-input"
                    type="tel"
                    maxLength="10"
                    placeholder="Enter mobile number"
                    value={mobile}
                    disabled={loading}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setMobile(value);
                      setError("");
                    }}
                  />
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button
                type="button"
                className="login-submit-button"
                disabled={loading}
                onClick={handleSendOtp}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="otp-input">OTP</label>

                <div className="otp-input-wrapper">
                  <input
                    id="otp-input"
                    type="tel"
                    maxLength="6"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    disabled={loading}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setOtp(value);
                      setError("");
                    }}
                  />
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <button
                type="button"
                className="login-submit-button"
                disabled={loading}
                onClick={handleVerifyOtp}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="resend-otp-container">
                <span>Didn't receive the OTP?</span>

                {resendTimer > 0 ? (
                  <span className="resend-timer">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    className="resend-otp-button"
                    disabled={loading}
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                className="change-number-button"
                disabled={loading}
                onClick={handleChangeNumber}
              >
                Change Mobile Number
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default Login;