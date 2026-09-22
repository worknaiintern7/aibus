import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token"));
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await authService.getProfile();
          if (res?.data) {
            setAdmin(res.data);
            localStorage.setItem("admin_user", JSON.stringify(res.data));
          }
        } catch {
          // Token invalid or expired
          setToken(null);
          setAdmin(null);
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = (authData) => {
    const { token: newToken, admin: adminProfile } = authData;
    setToken(newToken);
    setAdmin(adminProfile);
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_user", JSON.stringify(adminProfile));
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: !!token && !!admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
