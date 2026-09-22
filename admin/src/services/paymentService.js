import api from "./api";

export const paymentService = {
  getPayments: async (page = 0, size = 20, status = "") => {
    const params = new URLSearchParams({ page, size });
    if (status) params.append("status", status);
    return await api.get(`/payments?${params.toString()}`);
  },

  getPaymentById: async (id) => {
    return await api.get(`/payments/${id}`);
  },
};
