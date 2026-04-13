import axiosInstance from "./axiosInstance";

const employeePortalService = {

  // ── Home stats ────────────────────────────────────────────────────────────
  getHome: () =>
    axiosInstance.get("/api/employee/home").then(r => r.data.data),

  // ── Profile ───────────────────────────────────────────────────────────────
  getProfile: () =>
    axiosInstance.get("/api/employee/profile").then(r => r.data.data),

  // ── Monthly Attendance ────────────────────────────────────────────────────
  getAttendance: (year, month) =>
    axiosInstance.get(`/api/employee/attendance?year=${year}&month=${month}`)
      .then(r => r.data.data),

  // ── Payments ──────────────────────────────────────────────────────────────
  getPayments: (from, to) =>
    axiosInstance.get(`/api/employee/payments?from=${from}&to=${to}`)
      .then(r => r.data.data),

  // ── Assigned Tools ────────────────────────────────────────────────────────
  getTools: () =>
    axiosInstance.get("/api/employee/tools").then(r => r.data.data),
};

export default employeePortalService;
