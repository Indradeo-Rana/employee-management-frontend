import axiosInstance from "./axiosInstance";

const authService = {

  // ── Login ──────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const res = await axiosInstance.post("/api/auth/login", { email, password });
    return res.data.data;
  },

  // ── Register via invite ────────────────────────────────────────────────────
  register: async (name, token, password) => {
    const res = await axiosInstance.post("/api/auth/register", { name, token, password });
    return res.data.data;
  },

  // ── Validate invite token ──────────────────────────────────────────────────
  validateInviteToken: async (token) => {
    const res = await axiosInstance.get(`/api/auth/validate-invite?token=${token}`);
    return res.data.data;
  },

  // ── Send invite ────────────────────────────────────────────────────────────
  sendInvite: async (email, role) => {
    const res = await axiosInstance.post("/api/admin/invite", { email, role });
    return res.data;
  },

  // ── Forgot Password — Step 1: Send OTP ────────────────────────────────────
  sendOtp: async (email) => {
    const res = await axiosInstance.post("/api/auth/forgot-password", { email });
    return res.data;
  },

  // ── Forgot Password — Step 2: Verify OTP ──────────────────────────────────
  verifyOtp: async (email, otp) => {
    const res = await axiosInstance.post("/api/auth/verify-otp", { email, otp });
    return res.data;
  },

  // ── Forgot Password — Step 3: Reset Password ──────────────────────────────
  resetPassword: async (email, otp, newPassword, confirmPassword) => {
    const res = await axiosInstance.post("/api/auth/reset-password", {
      email, otp, newPassword, confirmPassword,
    });
    return res.data;
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

export default authService;
