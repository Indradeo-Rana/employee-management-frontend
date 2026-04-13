import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { showError } from "../utils/toastHelper";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [inviteEmail, setInviteEmail] = useState("");
  const [tokenValid, setTokenValid] = useState(null); // null=checking, true, false
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Validate invite token on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    authService
      .validateInviteToken(token)
      .then((email) => {
        setInviteEmail(email);
        setTokenValid(true);
      })
      .catch(() => setTokenValid(false));
  }, [token]);

  // ── Submit Registration ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      showError("Password must be at least 8 characters");
      return;
    }

    try {
      const user = await register(name, token, password);

      // Redirect based on role
      if (user.role === "EMPLOYEE") {
        navigate("/employee/dashboard", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      showError(err.message);
    }
  };

  // ── Token Checking State ─────────────────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div style={styles.container}>
        <p style={{ color: "rgba(232,234,240,0.5)" }}>Validating your invitation...</p>
      </div>
    );
  }

  // ── Invalid Token ─────────────────────────────────────────────────────────────
  if (tokenValid === false) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={styles.title}>Invalid or Expired Link</h2>
          <p style={{ color: "rgba(232,234,240,0.45)", fontSize: "14px" }}>
            This invitation link is invalid or has already been used. Please
            contact your administrator for a new invite.
          </p>
        </div>
      </div>
    );
  }

  // ── Register Form ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Set Up Your Account</h2>
        <p style={{ color: "rgba(232,234,240,0.45)", fontSize: "13px", marginBottom: "1.5rem" }}>
          Invited as: <span style={{ color: "#818cf8" }}>{inviteEmail}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input style={{ ...styles.input, opacity: 0.6 }} value={inviteEmail} readOnly />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0a0f1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#0e1428",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.5rem",
  },
  formGroup: { marginBottom: "1rem" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(232,234,240,0.5)",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "0.5px solid rgba(99,102,241,0.25)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8eaf0",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg,#6366f1,#818cf8)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "0.5rem",
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default RegisterPage;
