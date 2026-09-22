import React, { useState, useEffect } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loading from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Pagination from "../components/common/Pagination";
import { auditService } from "../services/auditService";
import { formatDate } from "../utils/formatDate";
import { ShieldAlert, FileText, Calendar, User, Monitor } from "lucide-react";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 15;

  const fetchLogs = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      const res = await auditService.getAuditLogs(page, pageSize);
      const data = res.data?.data || res.data;
      if (data && Array.isArray(data.content)) {
        setLogs(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getActionBadgeClass = (action) => {
    if (!action) return "badge-neutral";
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("LOGIN")) {
      return "badge-success";
    }
    if (act.includes("UPDATE") || act.includes("EDIT") || act.includes("MODIFY")) {
      return "badge-info";
    }
    if (act.includes("DELETE") || act.includes("CANCEL") || act.includes("DEACTIVATE") || act.includes("BLOCK")) {
      return "badge-danger";
    }
    return "badge-warning";
  };

  return (
    <div className="admin-page">
      <PageHeader
        title="Audit Logs"
        subtitle="Track administrative actions and system security events"
        icon={ShieldAlert}
      />

      {loading ? (
        <Loading message="Loading audit logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchLogs(currentPage)} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          message="There are no security or audit log entries recorded yet."
          icon={FileText}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id || Math.random()}>
                    <td className="fw-semibold text-muted">#{log.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={14} className="text-secondary" />
                        <span>{formatDate(log.createdAt || log.timestamp)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <User size={14} className="text-secondary" />
                        <span className="fw-medium">
                          {log.performedBy || log.adminEmail || log.adminName || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="text-wrap text-muted" style={{ maxWidth: "300px" }}>
                      {log.details || "-"}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Monitor size={14} />
                        <code>{log.ipAddress || "N/A"}</code>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalElements={totalElements}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
