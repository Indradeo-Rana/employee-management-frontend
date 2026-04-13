import { useEffect, useState, useCallback } from "react";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

const dayColor = (d) => {
  if (d === 0)   return { bg: "rgba(248,113,113,0.12)", color: "#f87171" };
  if (d === 0.5) return { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" };
  if (d === 1)   return { bg: "rgba(52,211,153,0.12)",  color: "#34d399" };
  return           { bg: "rgba(129,140,248,0.12)",       color: "#818cf8" };
};

const dayLabel = (d) => {
  if (d === 0)   return "Absent";
  if (d === 0.5) return "Half Day";
  if (d === 1)   return "Present";
  return `${d}d OT`;
};

const EmployeeAttendance = () => {
  const now = new Date();
  const [year,    setYear]    = useState(now.getFullYear());
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    employeePortalService.getAttendance(year, month)
      .then(setData)
      .catch(err => showError(err.response?.data?.message || "Failed to load attendance data"))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={pageTitle}>My Attendance</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: "15px", minWidth: "160px", textAlign: "center" }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {[
          { label: "Absent",      color: "#f87171" },
          { label: "Half Day",    color: "#fbbf24" },
          { label: "Present",     color: "#34d399" },
          { label: "Overtime",    color: "#818cf8" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: l.color, display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "rgba(232,234,240,0.4)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={emptyTxt}>Loading...</p>
      ) : !data || data.records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</p>
          <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "14px" }}>
            No attendance records for {MONTHS[month - 1]} {year}
          </p>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {[
              { label: "Total Days",    value: `${data.totalDays} days`, color: "#818cf8" },
              { label: "Total Salary",  value: fmt(data.totalSalary),    color: "#fbbf24" },
              { label: "Records",       value: data.records.length,      color: "#34d399" },
            ].map(s => (
              <div key={s.label} style={summaryCard}>
                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "4px" }}>{s.label}</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Attendance Table ── */}
          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Day", "Status", "Site", "Note"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.records.map(r => {
                  const { bg, color } = dayColor(r.days);
                  const d = new Date(r.date);
                  const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
                  return (
                    <tr key={r.id} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={td}>
                        <span style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>
                          {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ color: "rgba(232,234,240,0.5)", fontSize: "12px" }}>{dayName}</span>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: "12px", padding: "3px 12px", borderRadius: "20px", background: bg, color, fontWeight: 600 }}>
                          {dayLabel(r.days)}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ color: "rgba(232,234,240,0.45)", fontSize: "12px" }}>
                          {r.siteName || "—"}
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ color: "rgba(232,234,240,0.35)", fontSize: "12px" }}>
                          {r.note || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const pageTitle  = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff" };
const navBtn     = { background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "8px", width: "32px", height: "32px", color: "#e8eaf0", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const summaryCard = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1rem 1.25rem", flex: 1, minWidth: "140px" };
const tableWrap  = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "auto" };
const th         = { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.4)", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap" };
const td         = { padding: "12px 16px", verticalAlign: "middle" };
const emptyTxt   = { color: "rgba(232,234,240,0.3)", fontSize: "14px", padding: "3rem", textAlign: "center" };

export default EmployeeAttendance;
