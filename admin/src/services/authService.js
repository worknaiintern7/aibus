import api from "./api";

export const authService = {
  login: async (email, password) => {
    return await api.post("/auth/login", { email, password });
  },

  getProfile: async () => {
    return await api.get("/auth/me");
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout API failures
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
  },
};
