import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus, CircleUserRound } from "lucide-react";
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
            <span className="logo-text-gold">AI</span>
            <span className="logo-text-dark">BUS</span>
          </span>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="nav-link-item home-nav-link">Home</Link>
          <Link to="/pnr-status" className="nav-link-item">
            Track PNR
          </Link>
          <Link to="/my-bookings" className="nav-link-item">
            My Bookings
          </Link>
          <a href="#offers-and-more" className="nav-link-item">Offers</a>
          <a href="#support" className="nav-link-item">Support</a>

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
            <Link to="/login" className="login-button"><CircleUserRound size={18} /><span>Sign In</span></Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
