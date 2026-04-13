import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";

const Header = ({ collapsed, onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EMPLOYEE");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const profileRef = useRef(null);

  // ── Live clock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDate = (d) =>
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const formatTime = (d) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteMsg("");
    try {
      await authService.sendInvite(inviteEmail, inviteRole);
      setInviteMsg("✅ Invite sent successfully!");
      setInviteEmail("");
      setTimeout(() => { setShowInvite(false); setInviteMsg(""); }, 2000);
    } catch {
      setInviteMsg("❌ Failed to send invite. Try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const sidebarWidth = collapsed ? 68 : 220;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        right: 0,
        height: "64px",
        background: "rgba(10,15,30,0.95)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        padding: "0 1.5rem",
        gap: "1rem",
        zIndex: 40,
        transition: "left 0.25s ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Admin + Date/Time ── */}
      <div style={{ flex: "0 0 auto" }}>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: "14px", lineHeight: 1.2 }}>
          {user?.name || "Admin"}
        </p>
        <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>
          {formatDate(time)} &nbsp;|&nbsp; {formatTime(time)}
        </p>
      </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Search ── */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "rgba(232,234,240,0.3)", fontSize: "13px" }}>🔍</span>
        <input
          value={searchVal}
          onChange={handleSearch}
          placeholder="Search..."
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "7px 12px 7px 30px",
            color: "#e8eaf0",
            fontSize: "13px",
            outline: "none",
            width: "180px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>

      {/* ── Invite Button ── */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => { setShowInvite(!showInvite); setShowProfile(false); }}
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "0.5px solid rgba(99,102,241,0.35)",
            borderRadius: "10px",
            padding: "7px 14px",
            color: "#a5b4fc",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          + Invite
        </button>

        {/* Invite Dropdown */}
        {showInvite && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#0e1428",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "1.25rem",
            width: "260px",
            zIndex: 200,
          }}>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "13px", marginBottom: "1rem" }}>
              Send Invite
            </p>
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={inputStyle}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{ ...inputStyle, marginTop: "8px" }}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
            {inviteMsg && (
              <p style={{ fontSize: "12px", color: inviteMsg.startsWith("✅") ? "#34d399" : "#f87171", margin: "8px 0 0" }}>
                {inviteMsg}
              </p>
            )}
            <button
              onClick={handleSendInvite}
              disabled={inviteLoading}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "9px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(90deg,#6366f1,#818cf8)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {inviteLoading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        )}
      </div>

      {/* ── Profile ── */}
      <div ref={profileRef} style={{ position: "relative" }}>
        <button
          onClick={() => { setShowProfile(!showProfile); setShowInvite(false); }}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#818cf8)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontWeight: 700,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </button>

        {/* Profile Dropdown */}
        {showProfile && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#0e1428",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            padding: "1rem",
            width: "200px",
            zIndex: 200,
          }}>
            <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{user?.name}</p>
              <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{user?.email}</p>
              <span style={{
                display: "inline-block",
                marginTop: "4px",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "10px",
                background: "rgba(99,102,241,0.15)",
                color: "#a5b4fc",
                border: "0.5px solid rgba(99,102,241,0.3)",
              }}>{user?.role}</span>
            </div>
            <button onClick={() => { navigate("/admin/profile"); setShowProfile(false); }} style={dropdownBtnStyle}>
              👤 View Profile
            </button>
            <button onClick={() => { navigate("/admin/change-password"); setShowProfile(false); }} style={dropdownBtnStyle}>
              🔑 Change Password
            </button>
            <button onClick={handleLogout} style={{ ...dropdownBtnStyle, color: "rgba(239,68,68,0.8)", marginTop: "4px" }}>
              ← Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "0.5px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#e8eaf0",
  fontSize: "13px",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
};

const dropdownBtnStyle = {
  display: "block",
  width: "100%",
  padding: "8px 10px",
  background: "transparent",
  border: "none",
  color: "rgba(232,234,240,0.6)",
  fontSize: "13px",
  cursor: "pointer",
  textAlign: "left",
  borderRadius: "8px",
  fontFamily: "'DM Sans', sans-serif",
};

export default Header;
