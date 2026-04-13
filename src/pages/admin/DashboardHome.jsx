import { useEffect, useState } from "react";
import { dashboardService } from "../../services/adminServices";
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
      <p style={{ color: "rgba(232,234,240,0.45)", fontSize: "12px", fontWeight: 500 }}>{label}</p>
      <span style={{ fontSize: "18px" }}>{icon}</span>
    </div>
    <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.8rem", fontWeight: 700, color }}>{value}</p>
  </div>
);

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(err => showError(err.response?.data?.message || "Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={loadingStyle}>Loading dashboard...</p>;
  if (!stats)  return <p style={loadingStyle}>Failed to load stats.</p>;

  return (
    <div>
      <h1 style={pageTitle}>Dashboard</h1>

      {/* ── Stats Cards ── */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard label="Total Employees"     value={stats.totalEmployees}                                    color="#818cf8" icon="👥" />
        <StatCard label="Present Today"       value={stats.presentToday}                                      color="#34d399" icon="✅" />
        <StatCard label="Paid This Month"     value={`₹${stats.totalPaidThisMonth?.toLocaleString("en-IN")}`} color="#fbbf24" icon="💳" />
        <StatCard label="Tools In Use"        value={stats.toolsInUse}                                        color="#f87171" icon="🔧" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* ── Recent Attendance ── */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Recent Attendance</h2>
          {stats.recentAttendance?.length === 0
            ? <p style={emptyStyle}>No records yet.</p>
            : stats.recentAttendance?.map((a) => (
              <div key={a.id} style={listRow}>
                <div>
                  <p style={rowName}>{a.employeeName}</p>
                  <p style={rowSub}>{a.date} {a.siteName ? `• ${a.siteName}` : ""}</p>
                </div>
                <span style={{ ...daysBadge, background: a.days >= 1 ? "rgba(52,211,153,0.15)" : a.days === 0.5 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)", color: a.days >= 1 ? "#34d399" : a.days === 0.5 ? "#fbbf24" : "#f87171" }}>
                  {a.days === 0 ? "Absent" : a.days === 0.5 ? "Half Day" : `${a.days}d`}
                </span>
              </div>
            ))}
        </div>

        {/* ── Recent Payments ── */}
        <div style={cardStyle}>
          <h2 style={cardTitle}>Recent Payments</h2>
          {stats.recentPayments?.length === 0
            ? <p style={emptyStyle}>No payments yet.</p>
            : stats.recentPayments?.map((p) => (
              <div key={p.id} style={listRow}>
                <div>
                  <p style={rowName}>{p.employeeName || "General"}</p>
                  <p style={rowSub}>{p.category?.replace("_", " ")} • {p.paymentDate}</p>
                </div>
                <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "13px" }}>
                  ₹{p.amount?.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const pageTitle = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" };
const cardStyle = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem" };
const cardTitle = { color: "#fff", fontWeight: 600, fontSize: "14px", marginBottom: "1rem" };
const emptyStyle = { color: "rgba(232,234,240,0.3)", fontSize: "13px" };
const listRow    = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)" };
const rowName    = { color: "#e8eaf0", fontSize: "13px", fontWeight: 500 };
const rowSub     = { color: "rgba(232,234,240,0.4)", fontSize: "11px", marginTop: "2px" };
const daysBadge  = { fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600 };
const loadingStyle = { color: "rgba(232,234,240,0.4)", padding: "2rem", fontFamily: "'DM Sans',sans-serif" };

export default DashboardHome;
