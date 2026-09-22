import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../styles/admin.css";

export const AdminLayout = ({ pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const getTitle = () => {
    if (pageTitle) return pageTitle;
    const path = location.pathname;
    if (path.includes("/profile")) return "Admin Profile";
    if (path.includes("/users")) return "User Management";
    if (path.includes("/buses")) return "Bus Fleet";
    if (path.includes("/routes")) return "Route Management";
    if (path.includes("/schedules")) return "Schedules";
    if (path.includes("/bookings")) return "Bookings";
    if (path.includes("/payments")) return "Payments";
    if (path.includes("/reports")) return "Reports & Analytics";
    if (path.includes("/audit-logs")) return "Audit Logs";
    return "Dashboard";
  };

  return (
    <div className="admin-app">
      <div className={`admin-layout ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="admin-main">
          <Header
            title={getTitle()}
            onToggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
