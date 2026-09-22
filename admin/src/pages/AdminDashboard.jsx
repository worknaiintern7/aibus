import { useState, useEffect } from "react";
import {
  Users,
  Bus,
  MapPin,
  Calendar,
  Ticket,
  CheckCircle,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { dashboardService } from "../services/dashboardService";
import PageHeader from "../components/layout/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import { formatCurrency } from "../utils/formatCurrency";

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getOverview();
      setData(response?.data || null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loading text="Fetching live dashboard metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        subtitle="Real-time operational & financial performance metrics"
      />

      <div className="stat-grid">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(data?.totalRevenue)}
          icon={IndianRupee}
          color="#10b981"
        />
        <StatCard
          label="Total Bookings"
          value={data?.totalBookings || 0}
          icon={Ticket}
          color="var(--admin-primary)"
        />
        <StatCard
          label="Confirmed Bookings"
          value={data?.confirmedBookings || 0}
          icon={CheckCircle}
          color="#10b981"
        />
        <StatCard
          label="Cancelled Bookings"
          value={data?.cancelledBookings || 0}
          icon={XCircle}
          color="#ef4444"
        />
        <StatCard
          label="Registered Users"
          value={data?.totalUsers || 0}
          icon={Users}
          color="#6366f1"
        />
        <StatCard
          label="Bus Fleet Size"
          value={data?.totalBuses || 0}
          icon={Bus}
          color="#f59e0b"
        />
        <StatCard
          label="Active Routes"
          value={data?.totalRoutes || 0}
          icon={MapPin}
          color="var(--admin-primary)"
        />
        <StatCard
          label="Upcoming Schedules"
          value={data?.upcomingSchedules || 0}
          icon={Calendar}
          color="#8b5cf6"
        />
      </div>

      <div className="admin-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem" }}>
          System Health & Operational Status
        </h3>
        <p style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>
          All services connected cleanly to PostgreSQL backend API. Active bus routes:{" "}
          <strong>{data?.totalRoutes || 0}</strong> routes configured across{" "}
          <strong>{data?.totalBuses || 0}</strong> operational buses.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
