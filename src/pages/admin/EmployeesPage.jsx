import { useEffect, useState } from "react";
import { employeeService, siteService } from "../../services/adminServices";
import authService from "../../services/authService";
import { showError, showSuccess, showInfo } from "../../utils/toastHelper";

const EMPTY_FORM = {
  name: "", email: "", phone: "", designation: "",
  address: "", dailyRate: "", joiningDate: "", siteId: "",
};

const EmployeesPage = () => {
  const [employees, setEmployees]   = useState([]);
  const [sites, setSites]           = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("EMPLOYEE");
  const [inviteMsg, setInviteMsg]     = useState("");
  const [detailsId, setDetailsId]     = useState(null);
  const [details, setDetails]         = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([employeeService.getAll(), siteService.getAll()])
      .then(([emps, s]) => { setEmployees(emps); setSites(s); })
      .catch(err => showError(err.response?.data?.message || "Failed to load employees"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.trim().length > 1) {
      const res = await employeeService.search(q).catch(() => []);
      setEmployees(res);
    } else if (q.trim() === "") {
      fetchAll();
    }
  };

  // ── Open Add Form ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM); setEditId(null); setShowForm(true);
  };

  // ── Open Edit Form ────────────────────────────────────────────────────
  const openEdit = (emp) => {
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone || "",
      designation: emp.designation || "", address: emp.address || "",
      dailyRate: emp.dailyRate || "", joiningDate: emp.joiningDate || "",
      siteId: emp.siteId || "",
    });
    setEditId(emp.id); setShowForm(true);
  };

  // ── View Details ──────────────────────────────────────────────────────────
  const openDetails = async (id) => {
    setDetailsId(id); setDetails(null); setDetailsLoading(true);
    try {
      const data = await employeeService.getDetails(id);
      setDetails(data);
    } catch { setDetails(null); }
    finally { setDetailsLoading(false); }
  };

  // ── Submit Form ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        dailyRate: parseFloat(form.dailyRate) || 0,
        siteId: form.siteId || null,
        joiningDate: form.joiningDate || null,
      };
      if (editId) await employeeService.update(editId, payload);
      else        await employeeService.create(payload);
      setShowForm(false);
      showSuccess(editId ? "Employee updated successfully" : "Employee created successfully");
      fetchAll();
    } catch (err) {
      showError(err.response?.data?.message || "Something went wrong");
    } finally { setFormLoading(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await employeeService.delete(deleteId);
      setDeleteId(null);
      showSuccess("Employee deleted successfully");
      fetchAll();
    }
    catch (err) { showError(err.response?.data?.message || "Delete failed"); }
  };

  // ── Send Invite ───────────────────────────────────────────────────────────
  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await authService.sendInvite(inviteEmail, inviteRole);
      showSuccess("Invite sent successfully!");
      setTimeout(() => { setShowInvite(false); setInviteEmail(""); }, 2500);
    } catch { showError("Failed to send invite. Check email configuration."); }
  };

  const fmt = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={pageTitle}>Employees</h1>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => { setShowInvite(true); setInviteMsg(""); }} style={secondaryBtn}>📧 Send Invite</button>
          <button onClick={openAdd} style={primaryBtn}>+ Add Employee</button>
        </div>
      </div>

      {/* ── Search ── */}
      <input value={search} onChange={handleSearch}
        placeholder="🔍 Search by name, email or phone..."
        style={{ ...formInput, maxWidth: "380px", marginBottom: "1.25rem" }} />

      {/* ── Table ── */}
      <div style={tableWrap}>
        {loading ? <p style={emptyTxt}>Loading...</p>
          : employees.length === 0 ? <p style={emptyTxt}>No employees found.</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "Address", "Rate/Day", "Actions"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={td}>
                      <p style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "13px" }}>{emp.name}</p>
                      {emp.designation && <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{emp.designation}</p>}
                    </td>
                    <td style={td}><span style={{ color: "rgba(232,234,240,0.55)", fontSize: "12px" }}>{emp.email}</span></td>
                    <td style={td}><span style={{ color: "rgba(232,234,240,0.55)", fontSize: "12px" }}>{emp.phone || "—"}</span></td>
                    <td style={td}><span style={{ color: "rgba(232,234,240,0.45)", fontSize: "12px", maxWidth: "160px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.address || "—"}</span></td>
                    <td style={td}><span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "13px" }}>{fmt(emp.dailyRate)}</span></td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        <button onClick={() => openDetails(emp.id)} style={viewBtn}>👁 Details</button>
                        <button onClick={() => openEdit(emp)} style={editBtn}>Edit</button>
                        <button onClick={() => setDeleteId(emp.id)} style={deleteBtn}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <Modal title={editId ? "Edit Employee" : "Add Employee"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Full Name *",  key: "name",        type: "text",   placeholder: "John Doe" },
                { label: "Email *",      key: "email",       type: "email",  placeholder: "john@company.com" },
                { label: "Phone",        key: "phone",       type: "text",   placeholder: "+91 9876543210" },
                { label: "Designation",  key: "designation", type: "text",   placeholder: "Carpenter" },
                { label: "Daily Rate (₹) *", key: "dailyRate", type: "number", placeholder: "500" },
                { label: "Joining Date", key: "joiningDate", type: "date",   placeholder: "" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={formLabel}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={label.includes("*")} min={key === "dailyRate" ? "0" : undefined}
                    style={formInput} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={formLabel}>Address</label>
              <textarea placeholder="Full address..." value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                style={{ ...formInput, minHeight: "60px", resize: "vertical" }} />
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={formLabel}>Site / Project</label>
              <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} style={formInput}>
                <option value="">— None —</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button type="submit" disabled={formLoading} style={{ ...primaryBtn, width: "100%", marginTop: "1rem" }}>
              {formLoading ? "Saving..." : editId ? "Update Employee" : "Add Employee"}
            </button>
          </form>
        </Modal>
      )}

      {/* ── View Details Modal ── */}
      {detailsId && (
        <Modal title="Employee Details" onClose={() => { setDetailsId(null); setDetails(null); }} wide>
          {detailsLoading ? (
            <p style={emptyTxt}>Loading details...</p>
          ) : !details ? (
            <p style={{ color: "#f87171", fontSize: "13px" }}>Failed to load details.</p>
          ) : (
            <div>
              {/* Personal Info */}
              <SectionTitle>👤 Personal Information</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.5rem", marginBottom: "1.5rem" }}>
                <InfoRow label="Name"        value={details.name} />
                <InfoRow label="Email"       value={details.email} />
                <InfoRow label="Phone"       value={details.phone || "—"} />
                <InfoRow label="Designation" value={details.designation || "—"} />
                <InfoRow label="Daily Rate"  value={fmt(details.dailyRate)} highlight />
                <InfoRow label="Joining Date" value={details.joiningDate || "—"} />
                <InfoRow label="Site"        value={details.siteName || "—"} />
                <InfoRow label="Status"      value={details.status} />
              </div>
              {details.address && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <p style={formLabel}>Address</p>
                  <p style={{ color: "rgba(232,234,240,0.7)", fontSize: "13px" }}>{details.address}</p>
                </div>
              )}

              <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: "1.25rem" }} />

              {/* Attendance */}
              <SectionTitle>📅 Attendance Summary</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <StatBox label="Total Days (All Time)" value={`${details.totalDaysAllTime ?? 0} days`} color="#818cf8" />
                <StatBox label="This Month Days"       value={`${details.totalDaysThisMonth ?? 0} days`} color="#34d399" />
              </div>

              <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)", marginBottom: "1.25rem" }} />

              {/* Payment */}
              <SectionTitle>💰 Salary Summary</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <StatBox label="Total Earned"    value={fmt(details.totalEarned)}      color="#fbbf24" />
                <StatBox label="Total Paid"      value={fmt(details.totalSalaryPaid)}  color="#34d399" />
                <StatBox label="Remaining"       value={fmt(details.remainingSalary)}  color={details.remainingSalary > 0 ? "#f87171" : "#34d399"} />
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ── Invite Modal ── */}
      {showInvite && (
        <Modal title="Send Invite" onClose={() => { setShowInvite(false); setInviteMsg(""); setInviteEmail(""); }}>
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={formLabel}>Email Address</label>
            <input type="email" placeholder="employee@company.com" value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)} style={formInput} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={formLabel}>Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={formInput}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {inviteMsg && (
            <p style={{ color: inviteMsg.startsWith("✅") ? "#34d399" : "#f87171", fontSize: "12px", marginBottom: "0.75rem" }}>
              {inviteMsg}
            </p>
          )}
          <button onClick={handleInvite} style={{ ...primaryBtn, width: "100%" }}>Send Invite</button>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p style={{ color: "rgba(232,234,240,0.6)", fontSize: "14px", marginBottom: "1.5rem" }}>
            Are you sure? This will deactivate the employee.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => setDeleteId(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...deleteBtn, flex: 1, padding: "10px" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <p style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "13px", marginBottom: "0.75rem" }}>{children}</p>
);

const InfoRow = ({ label, value, highlight }) => (
  <div>
    <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "2px" }}>{label}</p>
    <p style={{ color: highlight ? "#fbbf24" : "#e8eaf0", fontSize: "13px", fontWeight: highlight ? 600 : 400 }}>{value}</p>
  </div>
);

const StatBox = ({ label, value, color }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem" }}>
    <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "6px" }}>{label}</p>
    <p style={{ color, fontFamily: "'Sora',sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>{value}</p>
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,20,0.78)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "1.75rem", width: "100%", maxWidth: wide ? "640px" : "480px", maxHeight: "90vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(232,234,240,0.4)", fontSize: "18px", cursor: "pointer" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const pageTitle    = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff" };
const primaryBtn   = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "10px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const secondaryBtn = { background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 18px", color: "rgba(232,234,240,0.7)", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const viewBtn      = { background: "rgba(56,189,248,0.1)", border: "0.5px solid rgba(56,189,248,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#38bdf8", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const editBtn      = { background: "rgba(99,102,241,0.12)", border: "0.5px solid rgba(99,102,241,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#818cf8", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const deleteBtn    = { background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#f87171", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const tableWrap    = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "auto" };
const th           = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" };
const td           = { padding: "12px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };
const emptyTxt     = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "2rem", textAlign: "center" };
const formLabel    = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput    = { width: "100%", padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

export default EmployeesPage;
