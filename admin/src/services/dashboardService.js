import api from "./api";

export const dashboardService = {
  getOverview: async () => {
    return await api.get("/dashboard/overview");
  },
};
