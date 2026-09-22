import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import authService from "../../services/authService";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authService.getLoggedInUser());

  useEffect(() => {
    const checkLoginStatus = () => {
      setUser(authService.getLoggedInUser());
    };

    window.addEventListener("storage", checkLoginStatus);
    window.addEventListener("loginStatusChanged", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      window.removeEventListener("loginStatusChanged", checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" aria-label="AIBus Home">
          <div className="logo-bus-icon">
            <Bus size={20} />
          </div>
          <span className="logo-text">
            <span className="logo-text-red">AI</span>
            <span className="logo-text-dark">Bus</span>
          </span>
        </Link>

        <nav className="header-nav">
          <Link to="/my-bookings" className="my-bookings-link">
            My Bookings
          </Link>

          {user ? (
            <div className="user-logged-nav">
              <span className="logged-in-mobile">
                <svg
                  className="user-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                +91 ******{user.mobile ? user.mobile.slice(-4) : "2356"}
              </span>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;