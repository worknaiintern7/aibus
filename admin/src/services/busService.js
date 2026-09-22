import api from "./api";

export const busService = {
  getBuses: async (page = 0, size = 20) => {
    return await api.get(`/buses?page=${page}&size=${size}`);
  },

  getBusById: async (id) => {
    return await api.get(`/buses/${id}`);
  },

  createBus: async (busData) => {
    return await api.post("/buses", busData);
  },

  updateBus: async (id, busData) => {
    return await api.put(`/buses/${id}`, busData);
  },

  updateBusStatus: async (id, active) => {
    return await api.patch(`/buses/${id}/status`, { active });
  },

  // Seats Layout APIs
  getBusSeats: async (busId) => {
    return await api.get(`/buses/${busId}/seats`);
  },

  createBusSeat: async (busId, seatData) => {
    return await api.post(`/buses/${busId}/seats`, seatData);
  },

  updateBusSeat: async (busId, seatId, seatData) => {
    return await api.put(`/buses/${busId}/seats/${seatId}`, seatData);
  },

  updateBusSeatStatus: async (busId, seatId, active) => {
    return await api.patch(`/buses/${busId}/seats/${seatId}/status`, { active });
  },
};
