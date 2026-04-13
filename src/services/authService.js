import axiosInstance from "./axiosInstance";

const authService = {

  // ── Login ────────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const res = await axiosInstance.post("/api/auth/login", { email, password });
    return res.data.data; // { accessToken, refreshToken, user }
  },

  // ── Register via invite link ──────────────────────────────────────────────────
  register: async (name, token, password) => {
    const res = await axiosInstance.post("/api/auth/register", { name, token, password });
    return res.data.data;
  },

  // ── Validate invite token (before showing register form) ──────────────────────
  validateInviteToken: async (token) => {
    const res = await axiosInstance.get(`/api/auth/validate-invite?token=${token}`);
    return res.data.data; // returns email string
  },

  // ── Send invite (admin/super-admin only) ──────────────────────────────────────
  sendInvite: async (email, role) => {
    const res = await axiosInstance.post("/api/admin/invite", { email, role });
    return res.data;
  },

  // ── Logout: just clear local storage ─────────────────────────────────────────
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

export default authService;
