import { useEffect, useState } from "react";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const COND_COLOR = { GOOD: "#34d399", NEEDS_REPAIR: "#fbbf24", OUT_OF_ORDER: "#f87171" };
const COND_LABEL = { GOOD: "Good", NEEDS_REPAIR: "Needs Repair", OUT_OF_ORDER: "Out of Order" };

const EmployeeMachines = () => {
  const [tools,   setTools]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeePortalService.getTools()
      .then(setTools)
      .catch(err => showError(err.response?.data?.message || "Failed to load machines data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={emptyTxt}>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={pageTitle}>My Machines</h1>
        <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "13px" }}>
          Tools currently assigned to you
        </p>
      </div>

      {tools.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔧</p>
          <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "14px" }}>
            No machines assigned to you currently.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "12px", marginBottom: "1rem" }}>
            {tools.length} machine{tools.length > 1 ? "s" : ""} assigned
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {tools.map(tool => (
              <div key={tool.id} style={card}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "16px", marginBottom: "4px" }}>🔧</p>
                    <h3 style={{ color: "#e8eaf0", fontWeight: 600, fontSize: "15px", marginBottom: "3px" }}>
                      {tool.name}
                    </h3>
                    {tool.toolCode && (
                      <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "11px" }}>
                        {tool.toolCode}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
                    background: `${COND_COLOR[tool.condition]}22`,
                    color: COND_COLOR[tool.condition],
                  }}>
                    {COND_LABEL[tool.condition]}
                  </span>
                </div>

                {/* Details */}
                <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={detailLabel}>Site</span>
                    <span style={detailValue}>{tool.assignedSiteName || "—"}</span>
                  </div>
                  {tool.assignedAt && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={detailLabel}>Assigned On</span>
                      <span style={detailValue}>
                        {new Date(tool.assignedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {tool.note && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={detailLabel}>Note</span>
                      <p style={{ color: "rgba(232,234,240,0.5)", fontSize: "12px", marginTop: "3px" }}>
                        {tool.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const pageTitle   = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "4px" };
const card        = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem" };
const emptyTxt    = { color: "rgba(232,234,240,0.3)", fontSize: "14px", padding: "3rem", textAlign: "center" };
const detailLabel = { color: "rgba(232,234,240,0.35)", fontSize: "11px" };
const detailValue = { color: "rgba(232,234,240,0.7)", fontSize: "12px", fontWeight: 500 };

export default EmployeeMachines;
