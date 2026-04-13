import { useEffect, useState } from "react";
import { paymentService, employeeService, siteService } from "../../services/adminServices";

const TODAY      = new Date().toISOString().split("T")[0];
const FIRST_DAY  = TODAY.slice(0, 7) + "-01";
const CATEGORIES = ["SALARY", "FOOD", "HOUSE_RENT", "FARE", "MACHINE_MAINTENANCE", "GST", "OTHER"];
const CAT_LABEL  = { SALARY: "Salary", FOOD: "Food", HOUSE_RENT: "House Rent", FARE: "Fare", MACHINE_MAINTENANCE: "Machine Maintenance", GST: "GST", OTHER: "Other" };
const CAT_COLOR  = { SALARY: "#818cf8", FOOD: "#34d399", HOUSE_RENT: "#fbbf24", FARE: "#f87171", MACHINE_MAINTENANCE: "#a78bfa", GST: "#38bdf8", OTHER: "rgba(232,234,240,0.5)" };

const EMPTY_FORM = { employeeId: "", category: "SALARY", amount: "", paymentDate: TODAY, note: "", siteId: "" };

const PaymentPage = () => {
  const [tab, setTab]           = useState("make");
  const [employees, setEmployees] = useState([]);
  const [sites, setSites]       = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg]   = useState("");

  // History
  const [filterFrom, setFilterFrom]       = useState(FIRST_DAY);
  const [filterTo, setFilterTo]           = useState(TODAY);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [history, setHistory]             = useState([]);
  const [histLoading, setHistLoading]     = useState(false);

  useEffect(() => {
    Promise.all([employeeService.getAll(), siteService.getAll()])
      .then(([emps, s]) => { setEmployees(emps); setSites(s); });
  }, []);

  // ── Submit Payment ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg("");
    try {
      await paymentService.create({
        employeeId: form.employeeId || null,
        category: form.category,
        amount: parseFloat(form.amount),
        paymentDate: form.paymentDate,
        note: form.note || null,
        siteId: form.siteId || null,
      });
      setFormMsg("✅ Payment recorded!");
      setForm(EMPTY_FORM);
      setTimeout(() => setFormMsg(""), 3000);
    } catch (err) {
      setFormMsg("❌ " + (err.response?.data?.message || "Failed to record payment"));
    } finally {
      setFormLoading(false);
    }
  };

  // ── Load History ──────────────────────────────────────────────────────────
  const loadHistory = async () => {
    setHistLoading(true);
    try {
      let data;
      if (filterEmployee) {
        data = await paymentService.getByEmployee(filterEmployee, filterFrom, filterTo);
      } else {
        data = await paymentService.getByRange(filterFrom, filterTo);
      }
      setHistory(data);
    } catch { setHistory([]); }
    finally { setHistLoading(false); }
  };

  useEffect(() => { if (tab === "history") loadHistory(); }, [tab]);

  const totalAmount = history.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <h1 style={pageTitle}>Payment</h1>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[{ key: "make", label: "Make Payment" }, { key: "history", label: "Payment History" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ ...tabBtn, ...(tab === t.key ? activeTab : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Make Payment ── */}
      {tab === "make" && (
        <div style={{ maxWidth: "520px" }}>
          <div style={card}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={formLabel}>Employee (optional)</label>
                <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} style={formInput}>
                  <option value="">— General / Non-employee expense —</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={formLabel}>Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={formInput} required>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <label style={formLabel}>Amount (₹) *</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })} style={formInput} required />
                </div>
                <div>
                  <label style={formLabel}>Payment Date *</label>
                  <input type="date" value={form.paymentDate}
                    onChange={e => setForm({ ...form, paymentDate: e.target.value })} style={formInput} required />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={formLabel}>Site / Project</label>
                <select value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value })} style={formInput}>
                  <option value="">— None —</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={formLabel}>Note</label>
                <textarea placeholder="Optional description..." value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  style={{ ...formInput, resize: "vertical", minHeight: "70px" }} />
              </div>

              {formMsg && <p style={{ color: formMsg.startsWith("✅") ? "#34d399" : "#f87171", fontSize: "13px", marginBottom: "0.75rem" }}>{formMsg}</p>}

              <button type="submit" disabled={formLoading} style={{ ...primaryBtn, width: "100%" }}>
                {formLoading ? "Recording..." : "Record Payment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── History ── */}
      {tab === "history" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={formLabel}>Employee</label>
              <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} style={{ ...formInput, width: "180px" }}>
                <option value="">All Employees</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={formLabel}>From</label>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={formInput} />
            </div>
            <div>
              <label style={formLabel}>To</label>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={formInput} />
            </div>
            <button onClick={loadHistory} style={primaryBtn}>Search</button>
          </div>

          {/* Summary */}
          {history.length > 0 && (
            <div style={{ marginBottom: "1rem", padding: "12px 16px", background: "rgba(99,102,241,0.08)", border: "0.5px solid rgba(99,102,241,0.2)", borderRadius: "12px", display: "inline-flex", gap: "2rem" }}>
              <span style={{ color: "rgba(232,234,240,0.55)", fontSize: "13px" }}>Total Records: <strong style={{ color: "#e8eaf0" }}>{history.length}</strong></span>
              <span style={{ color: "rgba(232,234,240,0.55)", fontSize: "13px" }}>Total Amount: <strong style={{ color: "#fbbf24" }}>₹{totalAmount.toLocaleString("en-IN")}</strong></span>
            </div>
          )}

          <div style={tableWrap}>
            {histLoading
              ? <p style={emptyTxt}>Loading...</p>
              : history.length === 0
                ? <p style={emptyTxt}>No payments found.</p>
                : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{["Employee", "Category", "Amount", "Date", "Site", "Note"].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {history.map(p => (
                        <tr key={p.id} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                          <td style={td}><span style={{ color: "#e8eaf0", fontSize: "13px" }}>{p.employeeName || "General"}</span></td>
                          <td style={td}>
                            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: `${CAT_COLOR[p.category]}22`, color: CAT_COLOR[p.category], fontWeight: 600 }}>
                              {CAT_LABEL[p.category]}
                            </span>
                          </td>
                          <td style={td}><span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "13px" }}>₹{p.amount?.toLocaleString("en-IN")}</span></td>
                          <td style={td}><span style={{ color: "rgba(232,234,240,0.5)", fontSize: "12px" }}>{p.paymentDate}</span></td>
                          <td style={td}><span style={{ color: "rgba(232,234,240,0.4)", fontSize: "12px" }}>{p.siteName || "—"}</span></td>
                          <td style={td}><span style={{ color: "rgba(232,234,240,0.35)", fontSize: "12px" }}>{p.note || "—"}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
          </div>
        </div>
      )}
    </div>
  );
};

const pageTitle  = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" };
const primaryBtn = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "10px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const tabBtn     = { background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 18px", color: "rgba(232,234,240,0.5)", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const activeTab  = { background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.35)", color: "#818cf8", fontWeight: 600 };
const card       = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" };
const tableWrap  = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "auto" };
const th         = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" };
const td         = { padding: "12px 16px", verticalAlign: "middle" };
const emptyTxt   = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "2rem", textAlign: "center" };
const formLabel  = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput  = { width: "100%", padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

export default PaymentPage;
