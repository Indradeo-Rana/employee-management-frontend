import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

// 3 Steps: EMAIL → OTP → NEW_PASSWORD
const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, SUCCESS: 4 };

const ForgotPasswordPage = () => {
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(STEPS.EMAIL);
  const [email,   setEmail]   = useState("");
  const [otp,     setOtp]     = useState("");
  const [newPw,   setNewPw]   = useState("");
  const [confPw,  setConfPw]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [msg,     setMsg]     = useState("");

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await authService.sendOtp(email);
      setMsg(`OTP sent to ${email}. Check your inbox.`);
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await authService.verifyOtp(email, otp);
      setStep(STEPS.NEW_PASSWORD);
      setMsg("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPw !== confPw) { setError("Passwords do not match"); return; }
    if (newPw.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      await authService.resetPassword(email, otp, newPw, confPw);
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally { setLoading(false); }
  };

  const stepLabel = ["Send OTP", "Verify OTP", "New Password"];

  return (
    <div style={styles.page}>
      <div style={styles.bgGrid} />
      <div style={styles.card}>

        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={styles.logoIcon}>🏢</div>
          <h1 style={styles.logoText}>NK<span style={{ color: "#818cf8" }}>Manage</span></h1>
        </div>

        {/* ── Step Indicator (only for steps 1-3) ── */}
        {step !== STEPS.SUCCESS && (
          <div style={styles.stepRow}>
            {stepLabel.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone   = step > stepNum;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    ...styles.stepCircle,
                    background: isDone ? "#34d399" : isActive ? "#6366f1" : "rgba(255,255,255,0.08)",
                    color: isDone || isActive ? "#fff" : "rgba(232,234,240,0.3)",
                  }}>
                    {isDone ? "✓" : stepNum}
                  </div>
                  <span style={{ fontSize: "11px", color: isActive ? "#e8eaf0" : "rgba(232,234,240,0.35)", display: step === 1 && i === 0 ? "inline" : "none" }}>
                  </span>
                  {i < stepLabel.length - 1 && (
                    <div style={{ width: "40px", height: "1px", background: isDone ? "#34d399" : "rgba(255,255,255,0.1)", margin: "0 4px" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === STEPS.EMAIL && (
          <>
            <h2 style={styles.title}>Forgot Password?</h2>
            <p style={styles.sub}>Enter your registered email. We'll send you an OTP.</p>
            <form onSubmit={handleSendOtp}>
              <label style={styles.label}>Email Address</label>
              <input type="email" value={email} required placeholder="you@company.com"
                onChange={e => setEmail(e.target.value)} style={styles.input} />
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === STEPS.OTP && (
          <>
            <h2 style={styles.title}>Enter OTP</h2>
            {msg && <p style={{ color: "#34d399", fontSize: "13px", marginBottom: "1rem" }}>{msg}</p>}
            <p style={styles.sub}>
              6-digit OTP sent to <strong style={{ color: "#818cf8" }}>{email}</strong>.
              Valid for 10 minutes.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <label style={styles.label}>OTP</label>
              <input type="text" value={otp} required placeholder="e.g. 482917"
                maxLength={6} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{ ...styles.input, letterSpacing: "6px", fontSize: "20px", textAlign: "center", fontWeight: 700 }} />
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>
              <button type="button" onClick={() => { setStep(STEPS.EMAIL); setError(""); setOtp(""); }}
                style={styles.backBtn}>
                ← Change Email
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === STEPS.NEW_PASSWORD && (
          <>
            <h2 style={styles.title}>Set New Password</h2>
            <p style={styles.sub}>OTP verified ✅ Now set your new password.</p>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "0.85rem" }}>
                <label style={styles.label}>New Password</label>
                <input type="password" value={newPw} required placeholder="Min. 8 characters"
                  onChange={e => setNewPw(e.target.value)} style={styles.input} />
              </div>
              <div style={{ marginBottom: "0.85rem" }}>
                <label style={styles.label}>Confirm New Password</label>
                <input type="password" value={confPw} required placeholder="Re-enter password"
                  onChange={e => setConfPw(e.target.value)} style={styles.input} />
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} style={styles.btn}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* ── Success ── */}
        {step === STEPS.SUCCESS && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={{ ...styles.title, marginBottom: "0.5rem" }}>Password Reset!</h2>
            <p style={styles.sub}>Your password has been reset successfully.</p>
            <button onClick={() => navigate("/")} style={{ ...styles.btn, marginTop: "1.5rem" }}>
              Go to Login
            </button>
          </div>
        )}

        {/* ── Back to Login (steps 1-3) ── */}
        {step !== STEPS.SUCCESS && (
          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "12px", color: "rgba(232,234,240,0.35)" }}>
            Remember your password?{" "}
            <button onClick={() => navigate("/")}
              style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", fontSize: "12px" }}>
              Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh", background: "#0a0f1e",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1rem", fontFamily: "'DM Sans', sans-serif", position: "relative",
  },
  bgGrid: {
    position: "fixed", inset: 0, zIndex: 0,
    backgroundImage: "linear-gradient(rgba(99,120,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,120,255,0.04) 1px,transparent 1px)",
    backgroundSize: "40px 40px", pointerEvents: "none",
  },
  card: {
    position: "relative", zIndex: 1, background: "#0e1428",
    border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: "22px",
    padding: "2.5rem 2rem", width: "100%", maxWidth: "420px",
  },
  logoIcon: {
    width: "44px", height: "44px", borderRadius: "12px",
    background: "linear-gradient(135deg,#6366f1,#22d3ee)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: "20px", marginBottom: "8px",
  },
  logoText: {
    fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "20px",
    color: "#fff", margin: 0,
  },
  stepRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "4px", marginBottom: "1.5rem",
  },
  stepCircle: {
    width: "28px", height: "28px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: 700, flexShrink: 0,
  },
  title: {
    fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "1.2rem",
    color: "#fff", marginBottom: "0.5rem",
  },
  sub: { color: "rgba(232,234,240,0.45)", fontSize: "13px", marginBottom: "1.5rem", lineHeight: 1.6 },
  label: { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" },
  input: {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: "0.5px solid rgba(99,102,241,0.25)", background: "rgba(255,255,255,0.04)",
    color: "#e8eaf0", fontSize: "14px", outline: "none",
    fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", marginBottom: "0.85rem",
  },
  error: { color: "rgba(239,68,68,0.85)", fontSize: "12px", marginBottom: "0.75rem", textAlign: "center" },
  btn: {
    width: "100%", padding: "12px", borderRadius: "10px", border: "none",
    background: "linear-gradient(90deg,#6366f1,#818cf8)", color: "#fff",
    fontSize: "14px", fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", marginBottom: "0.5rem",
  },
  backBtn: {
    width: "100%", padding: "10px", borderRadius: "10px",
    border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent",
    color: "rgba(232,234,240,0.5)", fontSize: "13px", cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif",
  },
  successIcon: { fontSize: "3rem", marginBottom: "1rem" },
};

export default ForgotPasswordPage;
