import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showError } from "../utils/toastHelper";

// ── Login Modal ───────────────────────────────────────────────────────────────
const LoginModal = ({ role, onClose }) => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const isAdmin = role === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showError("Please fill in all fields.");
      return;
    }

    try {
      const user = await login(email, password);
      setSuccess(true);

      setTimeout(() => {
        if (user.role === "EMPLOYEE") {
          navigate("/employee/dashboard", { replace: true });
        } else {
          navigate("/admin/dashboard", { replace: true });
        }
      }, 1500);
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={styles.modal}>
        {success ? (
          // ── Success State ────────────────────────────────────────────────────
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              style={{
                ...styles.successIcon,
                background: isAdmin
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(16,185,129,0.12)",
                border: isAdmin
                  ? "0.5px solid rgba(99,102,241,0.3)"
                  : "0.5px solid rgba(16,185,129,0.28)",
              }}
            >
              {isAdmin ? "🛠️" : "👷‍♂️"}
            </div>
            <p style={styles.successTitle}>
              {isAdmin ? "Welcome, Admin!" : "Welcome back!"}
            </p>
            <p style={styles.successSub}>Redirecting to dashboard...</p>
            <div style={styles.progressWrap}>
              <div
                style={{
                  ...styles.progressBar,
                  background: isAdmin
                    ? "linear-gradient(90deg,#6366f1,#818cf8)"
                    : "linear-gradient(90deg,#059669,#34d399)",
                  width: "100%",
                  transition: "width 1.5s linear",
                }}
              />
            </div>
          </div>
        ) : (
          // ── Login Form ───────────────────────────────────────────────────────
          <>
            <div style={styles.modalHeader}>
              <div>
                <p
                  style={{
                    ...styles.modalTag,
                    color: isAdmin ? "#818cf8" : "#34d399",
                  }}
                >
                  {isAdmin ? "Admin Portal" : "Employee Portal"}
                </p>
                <h2 style={styles.modalTitle}>
                  {isAdmin ? "Admin Sign In" : "Employee Sign In"}
                </h2>
              </div>
              <button style={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: isAdmin
                      ? "rgba(99,102,241,0.25)"
                      : "rgba(16,185,129,0.25)",
                  }}
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: isAdmin
                      ? "rgba(99,102,241,0.25)"
                      : "rgba(16,185,129,0.25)",
                  }}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={styles.dividerRow}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>Invite-only access</span>
                <div style={styles.dividerLine} />
              </div>

              <button
                style={{
                  ...styles.submitBtn,
                  background: isAdmin
                    ? "linear-gradient(90deg,#6366f1,#818cf8)"
                    : "linear-gradient(90deg,#059669,#34d399)",
                  opacity: loading ? 0.7 : 1,
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ── Landing Page ──────────────────────────────────────────────────────────────
const LandingPage = () => {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.bgGrid} />
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.content}>
        {/* ── Navbar ── */}
        <nav style={styles.navbar}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>🏢</div>
            <span style={styles.logoText}>
              NK<span style={{ color: "#818cf8" }}>Manage</span>
            </span>
          </div>
          <span style={styles.navBadge}>● System Active</span>
        </nav>

        {/* ── Hero ── */}
        <main style={styles.hero}>
          {/* Pill */}
          <div style={styles.pill}>
            <span style={styles.pillDot} />
            Secure • Role-Based • Invite-Only
          </div>

          {/* Title */}
          <h1 style={styles.heroTitle}>
            Employee Management
            <br />
            <span style={styles.gradient}>Simplified & Secured</span>
          </h1>

          <p style={styles.heroSub}>
            A unified platform for managing your workforce — attendance,
            payroll, and access control, all in one place.
          </p>

          {/* ── Cards ── */}
          <div style={styles.cardsRow}>
            {/* Admin Card */}
            <div
              style={styles.card}
              onClick={() => setActiveModal("admin")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <div style={{ ...styles.cardIcon, background: "rgba(99,102,241,0.15)", border: "0.5px solid rgba(99,102,241,0.3)" }}>
                🛠️
              </div>
              <p style={{ ...styles.cardTag, color: "#818cf8" }}>Admin Portal</p>
              <h3 style={styles.cardTitle}>Admin Login</h3>
              <p style={styles.cardDesc}>
                Manage employees, track attendance, handle payroll and send
                invite links to your team.
              </p>
              <button style={{ ...styles.cardBtn, background: "linear-gradient(90deg,#6366f1,#818cf8)" }}>
                Login as Admin
                <span style={styles.arrow}>→</span>
              </button>
            </div>

            {/* Employee Card */}
            <div
              style={styles.card}
              onClick={() => setActiveModal("employee")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <div style={{ ...styles.cardIcon, background: "rgba(16,185,129,0.12)", border: "0.5px solid rgba(16,185,129,0.28)" }}>
                👤
              </div>
              <p style={{ ...styles.cardTag, color: "#34d399" }}>Employee Portal</p>
              <h3 style={styles.cardTitle}>Employee Login</h3>
              <p style={styles.cardDesc}>
                View your attendance records, salary details and personal
                profile information.
              </p>
              <button style={{ ...styles.cardBtn, background: "linear-gradient(90deg,#059669,#34d399)" }}>
                Login as Employee
                <span style={styles.arrow}>→</span>
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={styles.statsRow}>
            {[
              { num: "JWT", label: "Secured Auth" },
              { num: "RBAC", label: "Role Based Access" },
              { num: "🔒", label: "Invite Only" },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={styles.statNum}>{s.num}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
                {i < arr.length - 1 && <div style={styles.statDivider} />}
              </div>
            ))}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer style={styles.footer}>
          © 2025 NKManage — All rights reserved. Unauthorized access is prohibited.
        </footer>
      </div>

      {/* ── Modal ── */}
      {activeModal && (
        <LoginModal role={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: { minHeight: "100vh", background: "#0a0f1e", color: "#e8eaf0", fontFamily: "'DM Sans',sans-serif", overflowX: "hidden", position: "relative" },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,120,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,120,255,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0 },
  bgGlow1: { position: "fixed", top: "-120px", left: "-120px", width: "500px", height: "500px", background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  bgGlow2: { position: "fixed", bottom: "-100px", right: "-100px", width: "450px", height: "450px", background: "radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  content: { position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" },
  navbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2.5rem", borderBottom: "0.5px solid rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", background: "rgba(10,15,30,0.7)", position: "sticky", top: 0, zIndex: 100 },
  logoWrap: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: "36px", height: "36px", background: "linear-gradient(135deg,#6366f1,#22d3ee)", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  logoText: { fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "18px", color: "#fff", letterSpacing: "-0.3px" },
  navBadge: { fontSize: "11px", padding: "4px 12px", borderRadius: "20px", background: "rgba(99,102,241,0.15)", border: "0.5px solid rgba(99,102,241,0.35)", color: "#a5b4fc", fontWeight: 500 },
  hero: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem 3rem", textAlign: "center" },
  pill: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "5px 14px", borderRadius: "20px", background: "rgba(16,185,129,0.1)", border: "0.5px solid rgba(16,185,129,0.3)", color: "#6ee7b7", fontWeight: 500, marginBottom: "1.5rem", letterSpacing: "0.5px" },
  pillDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" },
  heroTitle: { fontFamily: "'Sora',sans-serif", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700, color: "#fff", marginBottom: "1rem", lineHeight: 1.15, letterSpacing: "-0.5px" },
  gradient: { background: "linear-gradient(90deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: "16px", color: "rgba(232,234,240,0.55)", maxWidth: "480px", lineHeight: 1.7, marginBottom: "3.5rem" },
  cardsRow: { display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", width: "100%", maxWidth: "760px" },
  card: { flex: 1, minWidth: "280px", maxWidth: "340px", borderRadius: "20px", padding: "2rem 1.75rem", cursor: "pointer", border: "0.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", transition: "transform 0.25s ease,border-color 0.25s ease" },
  cardIcon: { width: "52px", height: "52px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "1.25rem" },
  cardTag: { fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.4rem" },
  cardTitle: { fontFamily: "'Sora',sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" },
  cardDesc: { fontSize: "13.5px", color: "rgba(232,234,240,0.45)", lineHeight: 1.65, marginBottom: "1.5rem" },
  cardBtn: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", width: "100%", color: "#fff" },
  arrow: { width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" },
  statsRow: { display: "flex", gap: "2.5rem", justifyContent: "center", marginTop: "3rem", flexWrap: "wrap" },
  statNum: { fontFamily: "'Sora',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: "11px", color: "rgba(232,234,240,0.35)", marginTop: "2px", letterSpacing: "0.5px" },
  statDivider: { width: "0.5px", background: "rgba(255,255,255,0.08)", alignSelf: "stretch" },
  footer: { textAlign: "center", padding: "1.5rem", fontSize: "12px", color: "rgba(232,234,240,0.2)", borderTop: "0.5px solid rgba(255,255,255,0.04)" },
  // Modal styles
  overlay: { position: "fixed", inset: 0, background: "rgba(5,8,20,0.78)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  modal: { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "22px", padding: "2.25rem 2rem", width: "100%", maxWidth: "400px" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" },
  modalTag: { fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" },
  modalTitle: { fontFamily: "'Sora',sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff" },
  closeBtn: { width: "32px", height: "32px", borderRadius: "8px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(232,234,240,0.5)", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  formGroup: { marginBottom: "1rem" },
  label: { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "6px" },
  input: { width: "100%", padding: "11px 14px", borderRadius: "10px", border: "0.5px solid", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "14px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" },
  dividerRow: { display: "flex", alignItems: "center", gap: "10px", margin: "1.25rem 0" },
  dividerLine: { flex: 1, height: "0.5px", background: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: "11px", color: "rgba(232,234,240,0.28)" },
  submitBtn: { width: "100%", padding: "12px", borderRadius: "10px", border: "none", fontSize: "14px", fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },
  successIcon: { width: "56px", height: "56px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 1rem" },
  successTitle: { fontFamily: "'Sora',sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" },
  successSub: { fontSize: "13px", color: "rgba(232,234,240,0.45)", marginBottom: "1.25rem" },
  progressWrap: { height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden", margin: "0 auto", maxWidth: "200px" },
  progressBar: { height: "100%", borderRadius: "4px", width: "0%" },
};

export default LandingPage;
