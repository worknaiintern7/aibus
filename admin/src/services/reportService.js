import api from "./api";

export const reportService = {
  getRevenueReport: async (startDate = "", endDate = "") => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return await api.get(`/reports/revenue?${params.toString()}`);
  },
};
