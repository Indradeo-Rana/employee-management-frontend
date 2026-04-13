import { createContext, useContext, useState, useCallback } from "react";
import authService from "../services/authService";
import { getStoredUser, isAuthenticated } from "../utils/jwtHelper";

// ── Create Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data.user; // caller uses role to redirect
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, token, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(name, token, password);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  // ── Role Checks ────────────────────────────────────────────────────────────
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isEmployee = user?.role === "EMPLOYEE";
  const isLoggedIn = isAuthenticated() && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isLoggedIn,
        isAdmin,
        isSuperAdmin,
        isEmployee,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
