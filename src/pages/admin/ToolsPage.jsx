import { useEffect, useState } from "react";
import { toolService, employeeService, siteService } from "../../services/adminServices";
import { showError, showSuccess } from "../../utils/toastHelper";

const STATUS_COLOR = { AVAILABLE: "#34d399", IN_USE: "#818cf8", MAINTENANCE: "#f87171" };
const COND_COLOR   = { GOOD: "#34d399", NEEDS_REPAIR: "#fbbf24", OUT_OF_ORDER: "#f87171" };
const EMPTY_FORM   = { name: "", toolCode: "", condition: "GOOD", note: "" };

const ToolsPage = () => {
  const [tools, setTools]           = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [sites, setSites]           = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [assignId, setAssignId]     = useState(null);
  const [assignData, setAssignData] = useState({ employeeId: "", siteId: "" });
  const [deleteId, setDeleteId]     = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([toolService.getAll(), employeeService.getAll(), siteService.getAll()])
      .then(([t, e, s]) => { setTools(t); setEmployees(e); setSites(s); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.trim().length > 1) setTools(await toolService.search(q));
    else if (q.trim() === "") fetchAll();
  };

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ name: t.name, toolCode: t.toolCode || "", condition: t.condition, note: t.note || "" }); setEditId(t.id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) await toolService.update(editId, form);
      else        await toolService.create(form);
      setShowForm(false);
      showSuccess(editId ? "Tool updated successfully" : "Tool created successfully");
      fetchAll();
    } catch (err) { showError(err.response?.data?.message || "Error"); }
    finally { setFormLoading(false); }
  };

  const handleAssign = async () => {
    try {
      await toolService.assign(assignId, { employeeId: assignData.employeeId || null, siteId: assignData.siteId || null });
      setAssignId(null);
      showSuccess("Tool assigned successfully");
      fetchAll();
    } catch (err) { showError(err.response?.data?.message || "Assign failed"); }
  };

  const handleUnassign = async (id) => {
    if (!window.confirm("Unassign this tool?")) return;
    await toolService.unassign(id);
    fetchAll();
  };

  const handleDelete = async () => {
    await toolService.delete(deleteId);
    setDeleteId(null);
    fetchAll();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={pageTitle}>Tools</h1>
        <button onClick={openAdd} style={primaryBtn}>+ Add Tool</button>
      </div>

      <input value={search} onChange={handleSearch} placeholder="🔍 Search by name or code..." style={{ ...formInput, maxWidth: "360px", marginBottom: "1.25rem" }} />

      <div style={tableWrap}>
        {loading
          ? <p style={emptyTxt}>Loading...</p>
          : tools.length === 0
            ? <p style={emptyTxt}>No tools found.</p>
            : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Tool", "Code", "Condition", "Status", "Assigned To", "Site", "Actions"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {tools.map(t => (
                    <tr key={t.id} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                      <td style={td}><span style={{ color: "#e8eaf0", fontWeight: 500, fontSize: "13px" }}>{t.name}</span></td>
                      <td style={td}><span style={{ color: "rgba(232,234,240,0.4)", fontSize: "12px" }}>{t.toolCode || "—"}</span></td>
                      <td style={td}><span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: `${COND_COLOR[t.condition]}22`, color: COND_COLOR[t.condition], fontWeight: 600 }}>{t.condition?.replace("_", " ")}</span></td>
                      <td style={td}><span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: `${STATUS_COLOR[t.status]}22`, color: STATUS_COLOR[t.status], fontWeight: 600 }}>{t.status?.replace("_", " ")}</span></td>
                      <td style={td}><span style={{ color: "rgba(232,234,240,0.5)", fontSize: "12px" }}>{t.assignedToName || "—"}</span></td>
                      <td style={td}><span style={{ color: "rgba(232,234,240,0.4)", fontSize: "12px" }}>{t.assignedSiteName || "—"}</span></td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          <button onClick={() => openEdit(t)} style={editBtn}>Edit</button>
                          {t.status !== "IN_USE"
                            ? <button onClick={() => { setAssignId(t.id); setAssignData({ employeeId: "", siteId: "" }); }} style={assignBtn}>Assign</button>
                            : <button onClick={() => handleUnassign(t.id)} style={unassignBtn}>Unassign</button>}
                          <button onClick={() => setDeleteId(t.id)} style={deleteBtn}>Del</button>
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
        <Modal title={editId ? "Edit Tool" : "Add Tool"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {[
              { label: "Tool Name *", key: "name",     placeholder: "Cutter Machine" },
              { label: "Tool Code",   key: "toolCode", placeholder: "CUTTER-001" },
              { label: "Note",        key: "note",     placeholder: "Optional note" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: "0.85rem" }}>
                <label style={formLabel}>{label}</label>
                <input type="text" placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={label.includes("*")} style={formInput} />
              </div>
            ))}
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={formLabel}>Condition</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} style={formInput}>
                <option value="GOOD">Good</option>
                <option value="NEEDS_REPAIR">Needs Repair</option>
                <option value="OUT_OF_ORDER">Out of Order</option>
              </select>
            </div>
            <button type="submit" disabled={formLoading} style={{ ...primaryBtn, width: "100%" }}>
              {formLoading ? "Saving..." : editId ? "Update Tool" : "Add Tool"}
            </button>
          </form>
        </Modal>
      )}

      {/* Assign Modal */}
      {assignId && (
        <Modal title="Assign Tool" onClose={() => setAssignId(null)}>
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={formLabel}>Assign To Employee</label>
            <select value={assignData.employeeId} onChange={e => setAssignData({ ...assignData, employeeId: e.target.value })} style={formInput}>
              <option value="">— Select Employee —</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={formLabel}>Site / Location</label>
            <select value={assignData.siteId} onChange={e => setAssignData({ ...assignData, siteId: e.target.value })} style={formInput}>
              <option value="">— Select Site —</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={handleAssign} style={{ ...primaryBtn, width: "100%" }}>Assign Tool</button>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Tool" onClose={() => setDeleteId(null)}>
          <p style={{ color: "rgba(232,234,240,0.6)", fontSize: "14px", marginBottom: "1.5rem" }}>Are you sure you want to delete this tool?</p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => setDeleteId(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...deleteBtn, flex: 1, padding: "10px" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(5,8,20,0.78)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "1.75rem", width: "100%", maxWidth: "420px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(232,234,240,0.4)", fontSize: "18px", cursor: "pointer" }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const pageTitle   = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff" };
const primaryBtn  = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "10px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const secondaryBtn= { background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 18px", color: "rgba(232,234,240,0.7)", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const editBtn     = { background: "rgba(99,102,241,0.12)", border: "0.5px solid rgba(99,102,241,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#818cf8", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const assignBtn   = { background: "rgba(52,211,153,0.1)", border: "0.5px solid rgba(52,211,153,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#34d399", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const unassignBtn = { background: "rgba(251,191,36,0.1)", border: "0.5px solid rgba(251,191,36,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#fbbf24", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const deleteBtn   = { background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: "7px", padding: "4px 10px", color: "#f87171", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const tableWrap   = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "auto" };
const th          = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" };
const td          = { padding: "12px 16px", verticalAlign: "middle" };
const emptyTxt    = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "2rem", textAlign: "center" };
const formLabel   = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput   = { width: "100%", padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

export default ToolsPage;
