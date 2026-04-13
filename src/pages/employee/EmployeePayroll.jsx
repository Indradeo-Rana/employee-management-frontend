import { useEffect, useState } from "react";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const TODAY      = new Date().toISOString().split("T")[0];
const FIRST_DAY  = TODAY.slice(0, 7) + "-01";
const YEAR_START = TODAY.slice(0, 4) + "-01-01";

const CAT_LABEL = {
  SALARY: "Salary", FOOD: "Food", HOUSE_RENT: "House Rent",
  FARE: "Fare", MACHINE_MAINTENANCE: "Machine Maint.", GST: "GST", OTHER: "Other",
};
const CAT_COLOR = {
  SALARY: "#818cf8", FOOD: "#34d399", HOUSE_RENT: "#fbbf24",
  FARE: "#f87171", MACHINE_MAINTENANCE: "#a78bfa", GST: "#38bdf8", OTHER: "rgba(232,234,240,0.5)",
};

const PRESETS = [
  { label: "This Month", from: FIRST_DAY,  to: TODAY },
  { label: "This Year",  from: YEAR_START, to: TODAY },
  { label: "All Time",   from: "2000-01-01", to: TODAY },
];

const EmployeePayroll = () => {
  const [from,    setFrom]    = useState(FIRST_DAY);
  const [to,      setTo]      = useState(TODAY);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = (f = from, t = to) => {
    setLoading(true);
    employeePortalService.getPayments(f, t)
      .then(setData)
      .catch(err => showError(err.response?.data?.message || "Failed to load payroll data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const applyPreset = (preset) => {
    setFrom(preset.from);
    setTo(preset.to);
    fetchData(preset.from, preset.to);
  };

  const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

  return (
    <div>
      <h1 style={pageTitle}>My Payroll</h1>

      {/* ── Summary Cards ── */}
      {data && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Earned (All Time)", value: fmt(data.totalEarned),           color: "#818cf8" },
            { label: "Total Salary Paid",        value: fmt(data.totalSalaryPaidAllTime), color: "#34d399" },
            { label: "Remaining Salary",         value: fmt(data.remainingSalary),
              color: data.remainingSalary > 0 ? "#f87171" : "#34d399" },
          ].map(s => (
            <div key={s.label} style={summaryCard}>
              <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "4px" }}>{s.label}</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        {/* Preset Buttons */}
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            style={{ ...presetBtn, ...(from === p.from && to === p.to ? activePreset : {}) }}>
            {p.label}
          </button>
        ))}

        {/* Custom Date */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginLeft: "0.5rem" }}>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={dateInput} />
          <span style={{ color: "rgba(232,234,240,0.3)", fontSize: "12px" }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={dateInput} />
          <button onClick={() => fetchData()} style={searchBtn}>Search</button>
        </div>
      </div>

      {/* ── Payment Table ── */}
      {loading ? (
        <p style={emptyTxt}>Loading...</p>
      ) : !data || data.payments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</p>
          <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "14px" }}>No payments found for this period.</p>
        </div>
      ) : (
        <>
          {/* Range summary */}
          <div style={{ marginBottom: "0.75rem", padding: "10px 14px", background: "rgba(99,102,241,0.07)", border: "0.5px solid rgba(99,102,241,0.18)", borderRadius: "10px", display: "inline-flex", gap: "1.5rem" }}>
            <span style={{ color: "rgba(232,234,240,0.5)", fontSize: "12px" }}>
              Records in range: <strong style={{ color: "#e8eaf0" }}>{data.payments.length}</strong>
            </span>
            <span style={{ color: "rgba(232,234,240,0.5)", fontSize: "12px" }}>
              Salary paid in range: <strong style={{ color: "#fbbf24" }}>{fmt(data.totalPaidInRange)}</strong>
            </span>
          </div>

          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Category", "Amount", "Site", "Note"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={td}>
                      <span style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: `${CAT_COLOR[p.category]}22`, color: CAT_COLOR[p.category], fontWeight: 600 }}>
                        {CAT_LABEL[p.category] || p.category}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "14px" }}>
                        {fmt(p.amount)}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ color: "rgba(232,234,240,0.45)", fontSize: "12px" }}>
                        {p.siteName || "—"}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{ color: "rgba(232,234,240,0.35)", fontSize: "12px" }}>
                        {p.note || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const pageTitle   = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" };
const summaryCard = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1rem 1.25rem", flex: 1, minWidth: "160px" };
const tableWrap   = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "auto" };
const th          = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" };
const td          = { padding: "12px 16px", verticalAlign: "middle" };
const emptyTxt    = { color: "rgba(232,234,240,0.3)", fontSize: "14px", padding: "3rem", textAlign: "center" };
const presetBtn   = { background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 14px", color: "rgba(232,234,240,0.6)", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const activePreset = { background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.35)", color: "#818cf8", fontWeight: 600 };
const dateInput   = { padding: "7px 10px", borderRadius: "8px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "12px", outline: "none", fontFamily: "'DM Sans',sans-serif" };
const searchBtn   = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "8px", padding: "7px 14px", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };

export default EmployeePayroll;
