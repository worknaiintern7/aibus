import api from "./api";

export const routeService = {
  getRoutes: async (page = 0, size = 20) => {
    return await api.get(`/routes?page=${page}&size=${size}`);
  },

  getRouteById: async (id) => {
    return await api.get(`/routes/${id}`);
  },

  createRoute: async (routeData) => {
    return await api.post("/routes", routeData);
  },

  updateRoute: async (id, routeData) => {
    return await api.put(`/routes/${id}`, routeData);
  },

  updateRouteStatus: async (id, active) => {
    return await api.patch(`/routes/${id}/status`, { active });
  },
};
