import { useEffect, useState } from "react";
import { noteService, siteService } from "../../services/adminServices";
import { showError, showSuccess } from "../../utils/toastHelper";

const EMPTY_FORM = { title: "", content: "", siteId: "" };

const NotesPage = () => {
  const [notes, setNotes]       = useState([]);
  const [sites, setSites]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandId, setExpandId] = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([noteService.getAll(), siteService.getAll()])
      .then(([n, s]) => { setNotes(n); setSites(s); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (n) => { setForm({ title: n.title, content: n.content || "", siteId: n.siteId || "" }); setEditId(n.id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...form, siteId: form.siteId || null };
      if (editId) await noteService.update(editId, payload);
      else        await noteService.create(payload);
      setShowForm(false);
      showSuccess(editId ? "Note updated successfully" : "Note created successfully");
      fetchAll();
    } catch (err) { showError(err.response?.data?.message || "Error saving note"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    await noteService.delete(deleteId);
    setDeleteId(null);
    fetchAll();
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={pageTitle}>Notes</h1>
        <button onClick={openAdd} style={primaryBtn}>+ New Note</button>
      </div>

      {loading ? (
        <p style={emptyTxt}>Loading...</p>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</p>
          <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "14px" }}>No notes yet. Create one!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {notes.map(n => (
            <div key={n.id} style={noteCard}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "14px", marginBottom: "3px" }}>{n.title}</h3>
                  {n.siteName && (
                    <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "20px", background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "0.5px solid rgba(99,102,241,0.25)" }}>
                      📍 {n.siteName}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                  <button onClick={() => openEdit(n)} style={iconBtn}>✏️</button>
                  <button onClick={() => setDeleteId(n.id)} style={{ ...iconBtn, color: "#f87171" }}>🗑️</button>
                </div>
              </div>

              {/* Content */}
              <p style={{ color: "rgba(232,234,240,0.5)", fontSize: "13px", lineHeight: 1.6, marginBottom: "0.75rem", whiteSpace: "pre-wrap" }}>
                {expandId === n.id || (n.content?.length || 0) <= 120
                  ? n.content || "No content."
                  : n.content.slice(0, 120) + "..."}
              </p>
              {(n.content?.length || 0) > 120 && (
                <button onClick={() => setExpandId(expandId === n.id ? null : n.id)}
                  style={{ background: "none", border: "none", color: "#818cf8", fontSize: "12px", cursor: "pointer", padding: 0, fontFamily: "'DM Sans',sans-serif" }}>
                  {expandId === n.id ? "Show less" : "Read more"}
                </button>
              )}

              {/* Footer */}
              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "0.5px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(232,234,240,0.3)", fontSize: "11px" }}>Created {formatDate(n.createdAt)}</span>
                {n.updatedAt && <span style={{ color: "rgba(232,234,240,0.25)", fontSize: "11px" }}>Edited {formatDate(n.updatedAt)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                {editId ? "Edit Note" : "New Note"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(232,234,240,0.4)", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "0.85rem" }}>
                <label style={formLabel}>Title *</label>
                <input type="text" placeholder="e.g. Site visit checklist" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required style={formInput} />
              </div>
              <div style={{ marginBottom: "0.85rem" }}>
                <label style={formLabel}>Site (optional)</label>
                <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} style={formInput}>
                  <option value="">— None —</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={formLabel}>Content</label>
                <textarea placeholder="Write your note here..." value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  style={{ ...formInput, minHeight: "140px", resize: "vertical" }} />
              </div>
              <button type="submit" disabled={formLoading} style={{ ...primaryBtn, width: "100%" }}>
                {formLoading ? "Saving..." : editId ? "Update Note" : "Save Note"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div style={modal}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Delete Note</h2>
            <p style={{ color: "rgba(232,234,240,0.6)", fontSize: "14px", marginBottom: "1.5rem" }}>Are you sure you want to delete this note?</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteId(null)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "9px", color: "#f87171", fontSize: "13px", cursor: "pointer", flex: 1, fontFamily: "'DM Sans',sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const pageTitle   = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff" };
const primaryBtn  = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "10px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const secondaryBtn= { background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 18px", color: "rgba(232,234,240,0.7)", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const noteCard    = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem" };
const iconBtn     = { background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 4px" };
const emptyTxt    = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "2rem", textAlign: "center" };
const overlay     = { position: "fixed", inset: 0, background: "rgba(5,8,20,0.78)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" };
const modal       = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "1.75rem", width: "100%", maxWidth: "460px" };
const formLabel   = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput   = { width: "100%", padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

export default NotesPage;
