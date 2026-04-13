import { useEffect, useState, useCallback } from "react";
import { attendanceService } from "../../services/adminServices";
import { showError, showSuccess } from "../../utils/toastHelper";

const DAY_OPTIONS = [
  { label: "—",     value: null  },
  { label: "0",     value: 0     },
  { label: "0.5",   value: 0.5   },
  { label: "1",     value: 1     },
  { label: "1.5",   value: 1.5   },
  { label: "2",     value: 2     },
  { label: "2.5",   value: 2.5   },
  { label: "3",     value: 3     },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const dayColor = (v) => {
  if (v === null || v === undefined) return "transparent";
  if (v === 0)   return "rgba(248,113,113,0.15)";
  if (v === 0.5) return "rgba(251,191,36,0.15)";
  if (v === 1)   return "rgba(52,211,153,0.15)";
  return "rgba(129,140,248,0.15)"; // overtime
};
const dayText = (v) => {
  if (v === null || v === undefined) return "rgba(232,234,240,0.2)";
  if (v === 0)   return "#f87171";
  if (v === 0.5) return "#fbbf24";
  if (v === 1)   return "#34d399";
  return "#818cf8";
};

const AttendancePage = () => {
  const now  = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1); // 1-12
  const [register, setRegister] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState({}); // { "empId-day": true }
  const [saveMsg, setSaveMsg]   = useState("");

  // ── Fetch register ────────────────────────────────────────────────────────
  const fetchRegister = useCallback(() => {
    setLoading(true);
    attendanceService.getRegister(year, month)
      .then(setRegister)
      .catch(err => showError(err.response?.data?.message || "Failed to load attendance register"))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => { fetchRegister(); }, [fetchRegister]);

  // ── Handle cell change ────────────────────────────────────────────────────
  const handleCellChange = async (employeeId, dayIndex, value) => {
    const day  = dayIndex + 1;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const key  = `${employeeId}-${day}`;

    // Optimistic UI update
    setRegister(prev => {
      const rows = prev.rows.map(row => {
        if (row.employeeId !== employeeId) return row;
        const newDays = [...row.days];
        newDays[dayIndex] = value;
        const total   = newDays.reduce((s, d) => s + (d ?? 0), 0);
        const salary  = total * row.dailyRate;
        return { ...row, days: newDays, totalDays: total, totalSalary: salary };
      });
      const grandTotalDays   = rows.reduce((s, r) => s + r.totalDays, 0);
      const grandTotalSalary = rows.reduce((s, r) => s + r.totalSalary, 0);
      return { ...prev, rows, grandTotalDays, grandTotalSalary };
    });

    if (value === null) return; // null = not marked, no API call needed

    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      await attendanceService.saveCell({ employeeId, date, days: value });
      showSuccess("Attendance saved");
    } catch (err) {
      showError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  // ── Year navigation ───────────────────────────────────────────────────────
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
        <h1 style={pageTitle}>Attendance Register</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: "15px", minWidth: "160px", textAlign: "center" }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
          {saveMsg && <span style={{ fontSize: "12px", marginLeft: "0.5rem", color: saveMsg.startsWith("✅") ? "#34d399" : "#f87171" }}>{saveMsg}</span>}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {[
          { label: "Absent (0)",    color: "#f87171" },
          { label: "Half (0.5)",    color: "#fbbf24" },
          { label: "Full (1)",      color: "#34d399" },
          { label: "Overtime (1.5+)", color: "#818cf8" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: l.color, display: "inline-block", opacity: 0.8 }} />
            <span style={{ fontSize: "11px", color: "rgba(232,234,240,0.45)" }}>{l.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={emptyTxt}>Loading register...</p>
      ) : !register || register.rows.length === 0 ? (
        <p style={emptyTxt}>No active employees found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
            <thead>
              {/* Month header row */}
              <tr>
                <th style={{ ...th, minWidth: "160px", position: "sticky", left: 0, background: "#0e1428", zIndex: 10 }}>
                  Employee
                </th>
                {register.headers.map(h => (
                  <th key={h.day} style={{
                    ...th,
                    minWidth: "52px",
                    textAlign: "center",
                    color: h.isFuture ? "rgba(232,234,240,0.2)" : "rgba(232,234,240,0.5)",
                    padding: "8px 4px",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: "12px" }}>{h.day}</div>
                    <div style={{ fontSize: "9px", letterSpacing: "0px", textTransform: "none", fontWeight: 400 }}>
                      {h.dayName}
                    </div>
                  </th>
                ))}
                <th style={{ ...th, minWidth: "90px", textAlign: "center", color: "#818cf8" }}>Total Days</th>
                <th style={{ ...th, minWidth: "110px", textAlign: "center", color: "#fbbf24" }}>Total Salary</th>
              </tr>
            </thead>

            <tbody>
              {register.rows.map(row => (
                <tr key={row.employeeId} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                  {/* Employee name — sticky */}
                  <td style={{ ...td, position: "sticky", left: 0, background: "#0e1428", zIndex: 5, borderRight: "0.5px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap" }}>{row.employeeName}</p>
                      <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "10px" }}>₹{row.dailyRate}/day</p>
                    </div>
                  </td>

                  {/* Day cells */}
                  {row.days.map((dayVal, idx) => {
                    const header = register.headers[idx];
                    const isFuture = header.isFuture;
                    const key = `${row.employeeId}-${idx + 1}`;
                    const isSaving = saving[key];

                    return (
                      <td key={idx} style={{ ...td, textAlign: "center", padding: "4px 3px" }}>
                        {isFuture ? (
                          <div style={{ width: "46px", height: "28px", margin: "0 auto", borderRadius: "6px", background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.04)" }} />
                        ) : (
                          <select
                            value={dayVal ?? ""}
                            onChange={e => {
                              const v = e.target.value === "" ? null : parseFloat(e.target.value);
                              handleCellChange(row.employeeId, idx, v);
                            }}
                            disabled={isSaving}
                            style={{
                              width: "46px",
                              padding: "3px 2px",
                              borderRadius: "6px",
                              border: "0.5px solid rgba(255,255,255,0.1)",
                              background: dayColor(dayVal),
                              color: isSaving ? "rgba(232,234,240,0.3)" : dayText(dayVal),
                              fontSize: "11px",
                              fontWeight: 600,
                              outline: "none",
                              cursor: isSaving ? "wait" : "pointer",
                              textAlign: "center",
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            {DAY_OPTIONS.map(o => (
                              <option key={String(o.value)} value={o.value ?? ""} style={{ background: "#0e1428", color: "#e8eaf0" }}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    );
                  })}

                  {/* Total Days */}
                  <td style={{ ...td, textAlign: "center" }}>
                    <span style={{ color: "#818cf8", fontWeight: 700, fontSize: "13px" }}>
                      {row.totalDays.toFixed(1)}
                    </span>
                  </td>

                  {/* Total Salary */}
                  <td style={{ ...td, textAlign: "center" }}>
                    <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "13px" }}>
                      {fmt(row.totalSalary)}
                    </span>
                  </td>
                </tr>
              ))}

              {/* ── Grand Total Row ── */}
              <tr style={{ background: "rgba(99,102,241,0.06)", borderTop: "1px solid rgba(99,102,241,0.2)" }}>
                <td style={{ ...td, position: "sticky", left: 0, background: "rgba(14,20,40,0.95)", zIndex: 5, borderRight: "0.5px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#818cf8", fontWeight: 700, fontSize: "13px" }}>TOTAL</span>
                </td>
                {register.headers.map((_, idx) => <td key={idx} style={td} />)}
                <td style={{ ...td, textAlign: "center" }}>
                  <span style={{ color: "#818cf8", fontWeight: 700, fontSize: "14px" }}>
                    {register.grandTotalDays.toFixed(1)}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "center" }}>
                  <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: "14px" }}>
                    {fmt(register.grandTotalSalary)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const pageTitle = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff" };
const navBtn    = { background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: "8px", width: "32px", height: "32px", color: "#e8eaf0", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const th        = { padding: "10px 8px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "rgba(232,234,240,0.45)", letterSpacing: "0.3px", textTransform: "uppercase", borderBottom: "0.5px solid rgba(255,255,255,0.08)", background: "#0e1428", whiteSpace: "nowrap" };
const td        = { padding: "8px 6px", verticalAlign: "middle" };
const emptyTxt  = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "3rem", textAlign: "center" };

export default AttendancePage;
