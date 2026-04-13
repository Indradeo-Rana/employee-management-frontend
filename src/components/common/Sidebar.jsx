import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard",  icon: "🏠", path: "/admin/dashboard" },
  { key: "employees",  label: "Employees",  icon: "👥", path: "/admin/employees" },
  { key: "attendance", label: "Attendance", icon: "📅", path: "/admin/attendance" },
  { key: "payment",    label: "Payment",    icon: "💳", path: "/admin/payment" },
  { key: "tools",      label: "Tools",      icon: "🔧", path: "/admin/tools" },
  { key: "reports",    label: "Reports",    icon: "📊", path: "/admin/reports" },
  { key: "notes",      label: "Notes",      icon: "📝", path: "/admin/notes" },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <aside
      style={{
        width: collapsed ? "68px" : "220px",
        minHeight: "100vh",
        background: "#0e1428",
        borderRight: "0.5px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* ── Logo + Toggle ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "1.25rem 0" : "1.25rem 1rem",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          minHeight: "64px",
        }}
      >
        {!collapsed && (
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            NK<span style={{ color: "#818cf8" }}>Manage</span>
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(232,234,240,0.6)",
            fontSize: "14px",
            flexShrink: 0,
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "10px 0" : "10px 1rem",
                justifyContent: collapsed ? "center" : "flex-start",
                border: "none",
                background: isActive
                  ? "rgba(99,102,241,0.15)"
                  : "transparent",
                borderLeft: isActive
                  ? "3px solid #6366f1"
                  : "3px solid transparent",
                color: isActive ? "#818cf8" : "rgba(232,234,240,0.55)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 400,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div style={{ padding: "0.75rem 0", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: collapsed ? "10px 0" : "10px 1rem",
            justifyContent: collapsed ? "center" : "flex-start",
            border: "none",
            background: "transparent",
            color: "rgba(239,68,68,0.7)",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(239,68,68,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(239,68,68,0.7)")}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
