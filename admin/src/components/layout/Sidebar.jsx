import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Bus,
  MapPin,
  Calendar,
  Ticket,
  CreditCard,
  BarChart3,
  ShieldCheck,
  User,
  LogOut,
  PanelLeftClose,
} from "lucide-react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export const Sidebar = ({ isOpen = true, onToggle }) => {
  const { logout } = useAdminAuth();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/users", icon: Users },
    { label: "Buses", path: "/buses", icon: Bus },
    { label: "Routes", path: "/routes", icon: MapPin },
    { label: "Schedules", path: "/schedules", icon: Calendar },
    { label: "Bookings", path: "/bookings", icon: Ticket },
    { label: "Payments", path: "/payments", icon: CreditCard },
    { label: "Reports", path: "/reports", icon: BarChart3 },
    { label: "Audit Logs", path: "/audit-logs", icon: ShieldCheck },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">
            <Bus size={20} />
          </div>
          <span>
            <span style={{ color: "var(--admin-primary)", fontWeight: "800" }}>AI</span>Bus{" "}
            <span className="admin-logo-badge">ADMIN</span>
          </span>
        </div>
        {onToggle && (
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onToggle}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `admin-nav-item ${isActive ? "active" : ""}`
          }
        >
          <User size={18} />
          <span>Admin Profile</span>
        </NavLink>
        <button
          onClick={logout}
          className="admin-nav-item logout-nav-btn"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
