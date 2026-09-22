import api from "./api";

export const bookingService = {
  getBookings: async (page = 0, size = 20, search = "", status = "") => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    return await api.get(`/bookings?${params.toString()}`);
  },

  getBookingByReference: async (bookingReference) => {
    return await api.get(`/bookings/${bookingReference}`);
  },

  cancelBooking: async (bookingReference) => {
    return await api.post(`/bookings/${bookingReference}/cancel`);
  },
};
