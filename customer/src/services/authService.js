import api from "./api";

const LOGIN_KEY = "loggedInUser";

export const authService = {
  getLoggedInUser: () => {
    try {
      const data = localStorage.getItem(LOGIN_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  sendOtp: async (mobile) => {
    const response = await api.post("/api/auth/send-otp", { mobile });
    return response.data;
  },

  verifyOtp: async (mobile, otp) => {
    const response = await api.post("/api/auth/verify-otp", { mobile, otp });
    const authData = response.data?.data;
    const user = authData?.user || { mobile };

    localStorage.setItem(LOGIN_KEY, JSON.stringify(user));
    authService.notifyLoginStateChange();

    return user;
  },

  logout: () => {
    localStorage.removeItem(LOGIN_KEY);
    authService.notifyLoginStateChange();
  },

  notifyLoginStateChange: () => {
    window.dispatchEvent(new Event("loginStatusChanged"));
  },
};

export default authService;
