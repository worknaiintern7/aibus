import api from "./api";

export const auditService = {
  getAuditLogs: async (page = 0, size = 20) => {
    return await api.get(`/audit-logs?page=${page}&size=${size}`);
  },
};
