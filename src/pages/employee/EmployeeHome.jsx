import { useEffect, useState } from "react";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "#0e1428",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "1.25rem 1.5rem",
    flex: 1,
    minWidth: "180px",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
      <p style={{ color: "rgba(232,234,240,0.45)", fontSize: "12px", fontWeight: 500 }}>{label}</p>
      <span style={{ fontSize: "18px" }}>{icon}</span>
    </div>
    <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.6rem", fontWeight: 700, color }}>{value}</p>
  </div>
);

const EmployeeHome = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeePortalService.getHome()
      .then(setStats)
      .catch(err => showError(err.response?.data?.message || "Failed to load home data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={txt}>Loading...</p>;
  if (!stats)  return <p style={{ ...txt, color: "#f87171" }}>Failed to load. Try again.</p>;

  const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

  return (
    <div>
      {/* ── Welcome ── */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
          Welcome back, {stats.name}! 👋
        </h1>
        <p style={{ color: "rgba(232,234,240,0.45)", fontSize: "14px" }}>
          {stats.designation || "Employee"}
          {stats.siteName && (
            <span style={{ marginLeft: "8px", padding: "2px 10px", borderRadius: "20px", background: "rgba(52,211,153,0.1)", border: "0.5px solid rgba(52,211,153,0.25)", color: "#34d399", fontSize: "11px" }}>
              📍 {stats.siteName}
            </span>
          )}
        </p>
      </div>

      {/* ── This Month Stats ── */}
      <p style={sectionTitle}>📅 This Month</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <StatCard label="Days Present"    value={`${stats.thisMonthDays} days`} color="#34d399" icon="✅" />
        <StatCard label="This Month Earned" value={fmt(stats.thisMonthEarned)}  color="#818cf8" icon="💰" />
        <StatCard label="Daily Rate"      value={fmt(stats.dailyRate)}           color="#fbbf24" icon="📋" />
      </div>

      {/* ── All Time Salary ── */}
      <p style={sectionTitle}>💰 Salary Summary</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <StatCard label="Total Earned (All Time)" value={fmt(stats.totalEarned)}     color="#818cf8" icon="📈" />
        <StatCard label="Total Salary Paid"        value={fmt(stats.totalSalaryPaid)} color="#34d399" icon="✅" />
        <StatCard label="Remaining Salary"         value={fmt(stats.remainingSalary)}
          color={stats.remainingSalary > 0 ? "#f87171" : "#34d399"} icon="⏳" />
      </div>

      {/* ── Quick Info Cards ── */}
      <p style={sectionTitle}>📊 Quick Info</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <StatCard label="Total Days (All Time)" value={`${stats.totalDaysAllTime} days`} color="#38bdf8" icon="📅" />
        {stats.assignedToolsCount > 0 && (
          <StatCard label="Machines Assigned" value={stats.assignedToolsCount} color="#a78bfa" icon="🔧" />
        )}
      </div>
    </div>
  );
};

const txt         = { color: "rgba(232,234,240,0.4)", fontSize: "14px", padding: "3rem", textAlign: "center" };
const sectionTitle = { color: "rgba(232,234,240,0.6)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "0.75rem" };

export default EmployeeHome;
