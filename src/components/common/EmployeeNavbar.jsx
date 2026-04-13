import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EmployeeNavbar = ({ hasTools, hasSite }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // Build nav items dynamically based on what employee has
  const navItems = [
    { label: "Home",       path: "/employee/home",       icon: "🏠", always: true  },
    { label: "Attendance", path: "/employee/attendance",  icon: "📅", always: true  },
    { label: "Payroll",    path: "/employee/payroll",     icon: "💰", always: true  },
    { label: "Machines",   path: "/employee/machines",    icon: "🔧", always: false, show: hasTools },
    { label: "Site",       path: "/employee/site",        icon: "📍", always: false, show: hasSite  },
  ].filter(item => item.always || item.show);

  return (
    <header style={styles.header}>
      {/* ── Logo ── */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏢</div>
        <span style={styles.logoText}>
          NK<span style={{ color: "#818cf8" }}>Manage</span>
        </span>
      </div>

      {/* ── Nav Links ── */}
      <nav style={styles.nav}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navBtn,
                color: isActive ? "#818cf8" : "rgba(232,234,240,0.6)",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                borderBottom: isActive
                  ? "2px solid #6366f1"
                  : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: "14px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Right: User + Logout ── */}
      <div style={styles.right}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase() || "E"}
          </div>
          <div>
            <p style={styles.userName}>{user?.name || "Employee"}</p>
            <p style={styles.userRole}>Employee</p>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          ← Logout
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "rgba(10,15,30,0.97)",
    borderBottom: "0.5px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    padding: "0 1.5rem",
    gap: "1.5rem",
    zIndex: 100,
    fontFamily: "'DM Sans', sans-serif",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  logoIcon: {
    width: "30px",
    height: "30px",
    background: "linear-gradient(135deg,#6366f1,#22d3ee)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#fff",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    border: "none",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s ease",
    height: "60px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#34d399,#059669)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "13px",
  },
  userName: {
    color: "#e8eaf0",
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1.2,
  },
  userRole: {
    color: "rgba(232,234,240,0.4)",
    fontSize: "10px",
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.08)",
    border: "0.5px solid rgba(239,68,68,0.25)",
    borderRadius: "8px",
    padding: "6px 14px",
    color: "rgba(239,68,68,0.8)",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
  },
};

export default EmployeeNavbar;
