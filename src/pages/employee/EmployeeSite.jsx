import { useEffect, useState } from "react";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const EmployeeSite = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeePortalService.getProfile()
      .then(setProfile)
      .catch(err => showError(err.response?.data?.message || "Failed to load site data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={emptyTxt}>Loading...</p>;

  if (!profile?.siteName) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📍</p>
        <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "14px" }}>
          No site assigned to you currently.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={pageTitle}>My Site</h1>

      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "14px",
            background: "rgba(52,211,153,0.12)", border: "0.5px solid rgba(52,211,153,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
          }}>
            📍
          </div>
          <div>
            <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "3px" }}>Currently Assigned Site</p>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "1.3rem", color: "#34d399" }}>
              {profile.siteName}
            </h2>
          </div>
        </div>

        <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", paddingTop: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[
              { label: "Your Name",    value: profile.name },
              { label: "Designation",  value: profile.designation || "—" },
              { label: "Email",        value: profile.email },
              { label: "Phone",        value: profile.phone || "—" },
              { label: "Joining Date", value: profile.joiningDate || "—" },
              { label: "Daily Rate",   value: `₹${Number(profile.dailyRate ?? 0).toLocaleString("en-IN")}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "11px", marginBottom: "3px" }}>{label}</p>
                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const pageTitle = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" };
const card      = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" };
const emptyTxt  = { color: "rgba(232,234,240,0.3)", fontSize: "14px", padding: "3rem", textAlign: "center" };

export default EmployeeSite;
