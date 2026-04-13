import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>EMPLOYEE</div>
        <h1 style={styles.title}>Employee Dashboard</h1>
        <p style={styles.sub}>
          Welcome back, <span style={{ color: "#34d399" }}>{user?.name}</span>
        </p>
        <p style={styles.info}>Email: {user?.email}</p>
        <p style={styles.info}>Role: {user?.role}</p>
        <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "13px", marginTop: "1.5rem" }}>
          ✅ JWT Authentication is working. Full dashboard coming next.
        </p>
        <button style={styles.button} onClick={handleLogout}>Logout</button>
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
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#0e1428",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1px",
    padding: "4px 14px",
    borderRadius: "20px",
    background: "rgba(16,185,129,0.12)",
    border: "0.5px solid rgba(16,185,129,0.3)",
    color: "#34d399",
    marginBottom: "1rem",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.5rem",
  },
  sub: {
    fontSize: "15px",
    color: "rgba(232,234,240,0.6)",
    marginBottom: "1rem",
  },
  info: {
    fontSize: "13px",
    color: "rgba(232,234,240,0.45)",
    marginBottom: "4px",
  },
  button: {
    marginTop: "1.5rem",
    padding: "10px 28px",
    borderRadius: "10px",
    border: "0.5px solid rgba(239,68,68,0.4)",
    background: "rgba(239,68,68,0.1)",
    color: "rgba(239,68,68,0.85)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};

export default EmployeeDashboard;
