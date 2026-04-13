import { useEffect, useState } from "react";
import { paymentService } from "../../services/adminServices";
import { showError } from "../../utils/toastHelper";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const TODAY     = new Date().toISOString().split("T")[0];
const SIX_MONTHS_AGO = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split("T")[0];
const CAT_LABEL = { SALARY: "Salary", FOOD: "Food", HOUSE_RENT: "House Rent", FARE: "Fare", MACHINE_MAINTENANCE: "Machine Maint.", GST: "GST", OTHER: "Other" };
const COLORS    = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#38bdf8", "#fb923c"];
const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ReportsPage = () => {
  const [from, setFrom]       = useState(SIX_MONTHS_AGO);
  const [to, setTo]           = useState(TODAY);
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getReport(from, to);
      setReport(data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to generate report.";
      showError(message);
      setReport(null);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, []);

  // Transform for charts
  const pieData = report
    ? Object.entries(report.categoryTotals || {}).map(([key, value]) => ({
        name: CAT_LABEL[key] || key,
        value: Math.round(value),
      }))
    : [];

  const barData = pieData;

  const lineData = (report?.monthlyTotals || []).map(m => ({
    name: `${MONTH_NAMES[m.month]} ${m.year}`,
    total: Math.round(m.total),
  }));

  const grandTotal = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <div>
      <h1 style={pageTitle}>Reports</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={formLabel}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={formInput} />
        </div>
        <div>
          <label style={formLabel}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={formInput} />
        </div>
        <button onClick={loadReport} style={primaryBtn}>Generate Report</button>
      </div>

      {loading && <p style={emptyTxt}>Generating report...</p>}

      {!loading && report && (
        <>
          {/* Summary card */}
          <div style={{ marginBottom: "1.5rem", padding: "1rem 1.5rem", background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "14px", display: "inline-flex", gap: "2rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "12px" }}>Total Expense</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#fbbf24" }}>₹{grandTotal.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "12px" }}>Categories</p>
              <p style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#818cf8" }}>{pieData.length}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            {/* Pie Chart */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Payment Distribution</h3>
              {pieData.length === 0
                ? <p style={emptyTxt}>No data.</p>
                : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e8eaf0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
            </div>

            {/* Bar Chart */}
            <div style={chartCard}>
              <h3 style={chartTitle}>Amount by Category</h3>
              {barData.length === 0
                ? <p style={emptyTxt}>No data.</p>
                : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(232,234,240,0.4)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "rgba(232,234,240,0.4)", fontSize: 10 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                      <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e8eaf0" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </div>
          </div>

          {/* Line Chart */}
          <div style={chartCard}>
            <h3 style={chartTitle}>Monthly Payment Trend</h3>
            {lineData.length === 0
              ? <p style={emptyTxt}>No monthly data.</p>
              : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(232,234,240,0.4)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(232,234,240,0.4)", fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString("en-IN")}`} contentStyle={{ background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e8eaf0" }} />
                    <Line type="monotone" dataKey="total" stroke="#818cf8" strokeWidth={2} dot={{ fill: "#818cf8", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </>
      )}
    </div>
  );
};

const pageTitle  = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" };
const primaryBtn = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "10px", padding: "9px 18px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const chartCard  = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem" };
const chartTitle = { color: "#e8eaf0", fontWeight: 600, fontSize: "14px", marginBottom: "1rem" };
const emptyTxt   = { color: "rgba(232,234,240,0.3)", fontSize: "13px", padding: "1rem", textAlign: "center" };
const formLabel  = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput  = { padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };

export default ReportsPage;
