import { useAdminAuth } from "../../hooks/useAdminAuth";
import { useTheme } from "../../context/ThemeContext";
import { LogOut, Menu, Sun, Moon } from "lucide-react";

export const Header = ({ title = "Dashboard", onToggleSidebar, sidebarOpen = true }) => {
  const { admin, logout } = useAdminAuth();
  const { toggleTheme, isDark } = useTheme();

  const getInitial = () => {
    if (admin?.name) return admin.name.charAt(0).toUpperCase();
    if (admin?.email) return admin.email.charAt(0).toUpperCase();
    return "A";
  };

  return (
    <header className="admin-header">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="admin-header-title">{title}</div>
      </div>

      <div className="admin-header-right">
        {/* Light / Dark Mode Toggle Button */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="admin-user-pill">
          <div className="admin-avatar">{getInitial()}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--admin-text-main)" }}>
              {admin?.name || "Admin"}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>
              {admin?.role || "ADMIN"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          title="Logout"
          style={{ padding: "0.4rem 0.6rem" }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;
