import { useEffect, useState } from "react";
import { employeeService, siteService, adminUserService } from "../../services/adminServices";
import authService from "../../services/authService";

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
  const [formError, setFormError]   = useState("");
  const [deleteId, setDeleteId]     = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("EMPLOYEE");
  const [inviteMsg, setInviteMsg]     = useState("");
  const [detailsId, setDetailsId]     = useState(null);
  const [details, setDetails]         = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Reset password state
  const [resetId, setResetId]       = useState(null);
  const [resetPw, setResetPw]       = useState("");
  const [resetConfPw, setResetConfPw] = useState("");
  const [resetMsg, setResetMsg]     = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([employeeService.getAll(), siteService.getAll()])
      .then(([emps, s]) => { setEmployees(emps); setSites(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.trim().length > 1) setEmployees(await employeeService.search(q).catch(() => []));
    else if (q.trim() === "") fetchAll();
  };

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(""); setShowForm(true); };
  const openEdit = (emp) => {
    setForm({ name: emp.name, email: emp.email, phone: emp.phone || "", designation: emp.designation || "", address: emp.address || "", dailyRate: emp.dailyRate || "", joiningDate: emp.joiningDate || "", siteId: emp.siteId || "" });
    setEditId(emp.id); setFormError(""); setShowForm(true);
  };

  const openDetails = async (id) => {
    setDetailsId(id); setDetails(null); setDetailsLoading(true);
    try { const data = await employeeService.getDetails(id); setDetails(data); }
    catch { setDetails(null); }
    finally { setDetailsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setFormError("");
    try {
      const payload = { ...form, dailyRate: parseFloat(form.dailyRate) || 0, siteId: form.siteId || null, joiningDate: form.joiningDate || null };
      if (editId) await employeeService.update(editId, payload);
      else        await employeeService.create(payload);
      setShowForm(false); fetchAll();
    } catch (err) { setFormError(err.response?.data?.message || "Something went wrong"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try { await employeeService.delete(deleteId); setDeleteId(null); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteMsg("");
    try {
      await authService.sendInvite(inviteEmail, inviteRole);
      setInviteMsg("✅ Invite sent successfully!");
      setTimeout(() => { setShowInvite(false); setInviteMsg(""); setInviteEmail(""); }, 2500);
    } catch { setInviteMsg("❌ Failed to send invite."); }
  };

  // ── Reset Password ──────────────────────────────────────────────────────────
  const openReset = (empId) => {
    setResetId(empId); setResetPw(""); setResetConfPw(""); setResetMsg("");
  };

  const handleReset = async () => {
    if (!resetPw || !resetConfPw) { setResetMsg("❌ Fill both fields"); return; }
    if (resetPw !== resetConfPw)  { setResetMsg("❌ Passwords do not match"); return; }
    if (resetPw.length < 8)       { setResetMsg("❌ Min. 8 characters"); return; }
    setResetLoading(true); setResetMsg("");
    try {
      await adminUserService.resetUserPassword(resetId, resetPw, resetConfPw);
      setResetMsg("✅ Password reset successfully!");
      setTimeout(() => { setResetId(null); setResetMsg(""); }, 2000);
    } catch (err) {
      setResetMsg("❌ " + (err.response?.data?.message || "Reset failed"));
    } finally { setResetLoading(false); }
  };

  const fmt = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={pageTitle}>Employees</h1>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => { setShowInvite(true); setInviteMsg(""); }} style={secondaryBtn}>📧 Send Invite</button>
          <button onClick={openAdd} style={primaryBtn}>+ Add Employee</button>
        </div>
      </div>

      <input value={search} onChange={handleSearch} placeholder="🔍 Search by name, email or phone..."
        style={{ ...formInput, maxWidth: "380px", marginBottom: "1.25rem" }} />

      <div style={tableWrap}>
        {loading ? <p style={emptyTxt}>Loading...</p>
          : employees.length === 0 ? <p style={emptyTxt}>No employees found.</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Name", "Email", "Phone", "Address", "Rate/Day", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={td}>
                      <p style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "13px" }}>{emp.name}</p>
                      {emp.designation && <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{emp.designation}</p>}
                    </td>
                    <td style={td}><span style={{ color: "rgba(232,234,240,0.55)", fontSize: "12px" }}>{emp.email}</span></td>
                    <td style={td}><span style={{ color: "rgba(232,234,240,0.55)", fontSize: "12px" }}>{emp.phone || "—"}</span></td>
                    <td style={td}><span style={{ color: "rgba(232,234,240,0.45)", fontSize: "12px", maxWidth: "140px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.address || "—"}</span></td>
                    <td style={td}><span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "13px" }}>{fmt(emp.dailyRate)}</span></td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        <button onClick={() => openDetails(emp.id)} style={viewBtn}>👁 Details</button>
                        <button onClick={() => openEdit(emp)} style={editBtn}>Edit</button>
                        <button onClick={() => openReset(emp.id)} style={resetBtn}>🔑 Reset</button>
                        <button onClick={() => setDeleteId(emp.id)} style={deleteBtn}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal title={editId ? "Edit Employee" : "Add Employee"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[{ label: "Full Name *", key: "name", type: "text", placeholder: "John Doe" }, { label: "Email *", key: "email", type: "email", placeholder: "john@company.com" }, { label: "Phone", key: "phone", type: "text", placeholder: "+91 9876543210" }, { label: "Designation", key: "designation", type: "text", placeholder: "Carpenter" }, { label: "Daily Rate (₹) *", key: "dailyRate", type: "number", placeholder: "500" }, { label: "Joining Date", key: "joiningDate", type: "date", placeholder: "" }]
                .map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label style={formLabel}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={label.includes("*")} min={key === "dailyRate" ? "0" : undefined} style={formInput} />
                  </div>
                ))}
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <label style={formLabel}>Address</label>
              <textarea placeholder="Full address..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ ...formInput, minHeight: "60px", resize: "vertical" }} />
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <label style={formLabel}>Site / Project</label>
              <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} style={formInput}>
                <option value="">— None —</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {formError && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "0.75rem" }}>{formError}</p>}
            <button type="submit" disabled={formLoading} style={{ ...primaryBtn, width: "100%", marginTop: "1rem" }}>
              {formLoading ? "Saving..." : editId ? "Update Employee" : "Add Employee"}
            </button>
          </form>
        </Modal>
      )}

      {/* View Details Modal */}
      {detailsId && (
        <Modal title="Employee Details" onClose={() => { setDetailsId(null); setDetails(null); }} wide>
          {detailsLoading ? <p style={emptyTxt}>Loading details...</p>
            : !details ? <p style={{ color: "#f87171", fontSize: "13px" }}>Failed to load.</p>
            : (
              <div>
                <p style={sLabel}>👤 Personal Information</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.5rem", marginBottom: "1.25rem" }}>
                  {[["Name", details.name], ["Email", details.email], ["Phone", details.phone || "—"], ["Designation", details.designation || "—"], ["Daily Rate", fmt(details.dailyRate)], ["Joining Date", details.joiningDate || "—"], ["Site", details.siteName || "—"], ["Status", details.status]].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "2px" }}>{l}</p>
                      <p style={{ color: l === "Daily Rate" ? "#fbbf24" : "#e8eaf0", fontSize: "13px", fontWeight: l === "Daily Rate" ? 600 : 400 }}>{v}</p>
                    </div>
                  ))}
                </div>
                {details.address && <div style={{ marginBottom: "1.25rem" }}><p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "4px" }}>Address</p><p style={{ color: "rgba(232,234,240,0.7)", fontSize: "13px" }}>{details.address}</p></div>}
                <div style={divider} />
                <p style={sLabel}>📅 Attendance Summary</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <SBox label="Total Days (All Time)" value={`${details.totalDaysAllTime ?? 0} days`} color="#818cf8" />
                  <SBox label="This Month Days" value={`${details.totalDaysThisMonth ?? 0} days`} color="#34d399" />
                </div>
                <div style={divider} />
                <p style={sLabel}>💰 Salary Summary</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <SBox label="Total Earned" value={fmt(details.totalEarned)} color="#fbbf24" />
                  <SBox label="Total Paid" value={fmt(details.totalSalaryPaid)} color="#34d399" />
                  <SBox label="Remaining" value={fmt(details.remainingSalary)} color={details.remainingSalary > 0 ? "#f87171" : "#34d399"} />
                </div>
              </div>
            )}
        </Modal>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <Modal title="🔑 Reset Password" onClose={() => { setResetId(null); setResetMsg(""); }}>
          <p style={{ color: "rgba(232,234,240,0.5)", fontSize: "13px", marginBottom: "1rem" }}>
            Set a new temporary password for this employee. Ask them to change it after login.
          </p>
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={formLabel}>New Password</label>
            <input type="password" placeholder="Min. 8 characters" value={resetPw}
              onChange={e => setResetPw(e.target.value)} style={formInput} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={formLabel}>Confirm Password</label>
            <input type="password" placeholder="Re-enter new password" value={resetConfPw}
              onChange={e => setResetConfPw(e.target.value)} style={formInput} />
          </div>
          {resetMsg && <p style={{ fontSize: "12px", color: resetMsg.startsWith("✅") ? "#34d399" : "#f87171", marginBottom: "0.75rem" }}>{resetMsg}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => setResetId(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
            <button onClick={handleReset} disabled={resetLoading} style={{ ...primaryBtn, flex: 1 }}>
              {resetLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </Modal>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <Modal title="Send Invite" onClose={() => { setShowInvite(false); setInviteMsg(""); setInviteEmail(""); }}>
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={formLabel}>Email Address</label>
            <input type="email" placeholder="employee@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={formInput} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={formLabel}>Role</label>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={formInput}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {inviteMsg && <p style={{ color: inviteMsg.startsWith("✅") ? "#34d399" : "#f87171", fontSize: "12px", marginBottom: "0.75rem" }}>{inviteMsg}</p>}
          <button onClick={handleInvite} style={{ ...primaryBtn, width: "100%" }}>Send Invite</button>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <p style={{ color: "rgba(232,234,240,0.6)", fontSize: "14px", marginBottom: "1.5rem" }}>Are you sure? This will deactivate the employee.</p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => setDeleteId(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...deleteBtn, flex: 1, padding: "10px" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SBox = ({ label, value, color }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.85rem" }}>
    <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "5px" }}>{label}</p>
    <p style={{ color, fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700 }}>{value}</p>
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,20,0.78)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={e => e.target === e.currentTarget && onClose()}>
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
const resetBtn     = { background: "rgba(251,191,36,0.1)", border: "0.5px solid rgba(251,191,36,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#fbbf24", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const deleteBtn    = { background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#f87171", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const tableWrap    = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "auto" };
const th           = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" };
const td           = { padding: "12px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.04)", verticalAlign: "middle" };
const emptyTxt     = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "2rem", textAlign: "center" };
const formLabel    = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput    = { width: "100%", padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };
const sLabel       = { color: "#e8eaf0", fontWeight: 600, fontSize: "13px", marginBottom: "0.75rem" };
const divider      = { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "1.25rem 0" };

export default EmployeesPage;
