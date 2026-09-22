import { useState, useEffect } from "react";
import { BarChart3, IndianRupee, Ticket, CheckCircle, XCircle, Users, Calendar } from "lucide-react";
import { reportService } from "../services/reportService";
import PageHeader from "../components/layout/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import Loading from "../components/common/Loading";
import ErrorState from "../components/common/ErrorState";
import Button from "../components/common/Button";
import { formatCurrency } from "../utils/formatCurrency";

export const AdminReports = () => {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getRevenueReport(startDate, endDate);
      setReportData(res?.data || null);
    } catch (err) {
      setError(err.message || "Failed to generate revenue report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div>
      <PageHeader
        title="Revenue & Performance Analytics"
        subtitle="Financial breakdown, total bookings, confirmed, and cancellations over date ranges"
      />

      <div className="admin-card reports-filter-card">
        <form onSubmit={handleApplyFilter} className="reports-filter-form">
          <div className="reports-filter-inputs">
            <div className="form-group reports-filter-group">
              <label className="form-label">
                <Calendar size={14} />
                <span>From Date</span>
              </label>
              <input
                type="date"
                className="form-control reports-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group reports-filter-group">
              <label className="form-label">
                <Calendar size={14} />
                <span>To Date</span>
              </label>
              <input
                type="date"
                className="form-control reports-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="reports-filter-actions">
            <Button
              type="submit"
              variant="primary"
              icon={BarChart3}
              loading={loading}
              className="reports-generate-btn"
            >
              Generate Report
            </Button>
          </div>
        </form>
      </div>

      {error && <ErrorState message={error} onRetry={fetchReport} />}

      {loading ? (
        <Loading text="Generating report metrics..." />
      ) : (
        <>
          <div className="reports-stat-grid">
            <StatCard
              label="Period Total Revenue"
              value={formatCurrency(reportData?.totalRevenue)}
              icon={IndianRupee}
              color="#10b981"
            />
            <StatCard
              label="Total Period Bookings"
              value={reportData?.totalBookings || 0}
              icon={Ticket}
              color="#0284c7"
            />
            <StatCard
              label="Confirmed Bookings"
              value={reportData?.confirmedBookings || 0}
              icon={CheckCircle}
              color="#10b981"
            />
            <StatCard
              label="Cancelled Bookings"
              value={reportData?.cancelledBookings || 0}
              icon={XCircle}
              color="#ef4444"
            />
            <StatCard
              label="Total Registered Users"
              value={reportData?.totalUsers || 0}
              icon={Users}
              color="#6366f1"
            />
          </div>

          <div className="admin-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--admin-text-main)", margin: 0 }}>
                Financial Summary Breakdown
              </h3>
              <span className="badge badge-info" style={{ fontWeight: "600" }}>
                {startDate} to {endDate}
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Metric Indicator</th>
                    <th style={{ textAlign: "right" }}>Reported Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Total Gross Revenue</td>
                    <td style={{ fontWeight: "700", color: "#10b981", fontSize: "1.05rem", textAlign: "right" }}>
                      {formatCurrency(reportData?.totalRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Confirmed Bookings Count</td>
                    <td style={{ textAlign: "right" }}>
                      <span className="badge badge-success">{reportData?.confirmedBookings || 0} Bookings</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Cancelled Bookings Count</td>
                    <td style={{ textAlign: "right" }}>
                      <span className="badge badge-danger">{reportData?.cancelledBookings || 0} Bookings</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "600" }}>Net Conversion Rate</td>
                    <td style={{ fontWeight: "700", textAlign: "right" }}>
                      {reportData?.totalBookings > 0
                        ? `${Math.round(((reportData?.confirmedBookings || 0) / reportData.totalBookings) * 100)}%`
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;
