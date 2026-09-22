import api from "./api";

export const scheduleService = {
  getSchedules: async (page = 0, size = 20, search = "", status = "") => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    return await api.get(`/schedules?${params.toString()}`);
  },

  getScheduleById: async (id) => {
    return await api.get(`/schedules/${id}`);
  },

  createSchedule: async (scheduleData) => {
    return await api.post("/schedules", scheduleData);
  },

  updateSchedule: async (id, scheduleData) => {
    return await api.put(`/schedules/${id}`, scheduleData);
  },

  updateScheduleStatus: async (id, status) => {
    return await api.patch(`/schedules/${id}/status`, { status });
  },
};
