import axiosInstance from "./axiosInstance";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => axiosInstance.get("/api/admin/dashboard/stats").then(r => r.data.data),
};

// ── Global Search ─────────────────────────────────────────────────────────────
export const searchService = {
  search: (q) => axiosInstance.get(`/api/admin/search?q=${encodeURIComponent(q)}`).then(r => r.data.data),
};

// ── Profile (Admin/Super Admin) ───────────────────────────────────────────────
export const profileService = {
  getAdminProfile:    ()       => axiosInstance.get("/api/profile/admin").then(r => r.data.data),
  updateAdminProfile: (data)   => axiosInstance.put("/api/profile/admin", data).then(r => r.data.data),
  changePassword:     (data)   => axiosInstance.put("/api/profile/change-password", data).then(r => r.data),
};

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeeService = {
  getAll:    ()       => axiosInstance.get("/api/admin/employees").then(r => r.data.data),
  getById:   (id)     => axiosInstance.get(`/api/admin/employees/${id}`).then(r => r.data.data),
  getDetails:(id)     => axiosInstance.get(`/api/admin/employees/${id}/details`).then(r => r.data.data),
  search:    (q)      => axiosInstance.get(`/api/admin/employees/search?q=${q}`).then(r => r.data.data),
  create:    (data)   => axiosInstance.post("/api/admin/employees", data).then(r => r.data.data),
  update:    (id, d)  => axiosInstance.put(`/api/admin/employees/${id}`, d).then(r => r.data.data),
  delete:    (id)     => axiosInstance.delete(`/api/admin/employees/${id}`).then(r => r.data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceService = {
  getRegister:  (year, month)       => axiosInstance.get(`/api/admin/attendance/register?year=${year}&month=${month}`).then(r => r.data.data),
  saveCell:     (data)              => axiosInstance.post("/api/admin/attendance/cell", data).then(r => r.data),
  bulkMark:     (data)              => axiosInstance.post("/api/admin/attendance/bulk", data).then(r => r.data.data),
  getByDate:    (date)              => axiosInstance.get(`/api/admin/attendance/date?date=${date}`).then(r => r.data.data),
  getByRange:   (from, to)          => axiosInstance.get(`/api/admin/attendance/range?from=${from}&to=${to}`).then(r => r.data.data),
  getByEmployee:(id, from, to)      => axiosInstance.get(`/api/admin/attendance/employee/${id}?from=${from}&to=${to}`).then(r => r.data.data),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentService = {
  create:        (data)        => axiosInstance.post("/api/admin/payments", data).then(r => r.data.data),
  getByRange:    (from, to)    => axiosInstance.get(`/api/admin/payments/range?from=${from}&to=${to}`).then(r => r.data.data),
  getByEmployee: (id, from, to)=> axiosInstance.get(`/api/admin/payments/employee/${id}?from=${from}&to=${to}`).then(r => r.data.data),
  getReport:     (from, to)    => axiosInstance.get(`/api/admin/payments/report?from=${from}&to=${to}`).then(r => r.data.data),
  delete:        (id)          => axiosInstance.delete(`/api/admin/payments/${id}`).then(r => r.data),
};

// ── Tools ─────────────────────────────────────────────────────────────────────
export const toolService = {
  getAll:          ()         => axiosInstance.get("/api/admin/tools").then(r => r.data.data),
  search:          (q)        => axiosInstance.get(`/api/admin/tools/search?q=${q}`).then(r => r.data.data),
  create:          (data)     => axiosInstance.post("/api/admin/tools", data).then(r => r.data.data),
  update:          (id, data) => axiosInstance.put(`/api/admin/tools/${id}`, data).then(r => r.data.data),
  assign:          (id, data) => axiosInstance.post(`/api/admin/tools/${id}/assign`, data).then(r => r.data.data),
  unassign:        (id)       => axiosInstance.post(`/api/admin/tools/${id}/unassign`).then(r => r.data.data),
  updateCondition: (id, cond) => axiosInstance.patch(`/api/admin/tools/${id}/condition?condition=${cond}`).then(r => r.data.data),
  delete:          (id)       => axiosInstance.delete(`/api/admin/tools/${id}`).then(r => r.data),
};

// ── Notes ─────────────────────────────────────────────────────────────────────
export const noteService = {
  getAll:  ()       => axiosInstance.get("/api/admin/notes").then(r => r.data.data),
  create:  (data)   => axiosInstance.post("/api/admin/notes", data).then(r => r.data.data),
  update:  (id, d)  => axiosInstance.put(`/api/admin/notes/${id}`, d).then(r => r.data.data),
  delete:  (id)     => axiosInstance.delete(`/api/admin/notes/${id}`).then(r => r.data),
};

// ── Sites ─────────────────────────────────────────────────────────────────────
export const siteService = {
  getAll:  ()       => axiosInstance.get("/api/admin/sites").then(r => r.data.data),
  create:  (data)   => axiosInstance.post("/api/admin/sites", data).then(r => r.data.data),
  update:  (id, d)  => axiosInstance.put(`/api/admin/sites/${id}`, d).then(r => r.data.data),
  delete:  (id)     => axiosInstance.delete(`/api/admin/sites/${id}`).then(r => r.data),
};
