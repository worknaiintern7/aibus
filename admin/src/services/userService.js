import api from "./api";

export const userService = {
  getUsers: async (page = 0, size = 20, search = "") => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append("search", search);
    return await api.get(`/users?${params.toString()}`);
  },

  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },

  updateUserStatus: async (id, active) => {
    return await api.patch(`/users/${id}/status`, { active });
  },
};
