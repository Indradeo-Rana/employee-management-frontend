import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { searchService, employeeService } from "../../services/adminServices";

// ── Employee Details Modal (reused from EmployeesPage) ────────────────────────
const DetailsModal = ({ empId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getDetails(empId)
      .then(setDetails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [empId]);

  const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

  return (
    <div style={modal.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal.box}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={modal.title}>Employee Details</h2>
          <button onClick={onClose} style={modal.closeBtn}>✕</button>
        </div>

        {loading ? <p style={emptyTxt}>Loading...</p> : !details ? (
          <p style={{ color: "#f87171", fontSize: "13px" }}>Failed to load.</p>
        ) : (
          <div>
            <p style={sectionTitle}>👤 Personal Information</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem 1.5rem", marginBottom: "1.25rem" }}>
              {[
                ["Name", details.name],
                ["Email", details.email],
                ["Phone", details.phone || "—"],
                ["Designation", details.designation || "—"],
                ["Daily Rate", fmt(details.dailyRate)],
                ["Joining Date", details.joiningDate || "—"],
                ["Site", details.siteName || "—"],
                ["Status", details.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "2px" }}>{label}</p>
                  <p style={{ color: label === "Daily Rate" ? "#fbbf24" : "#e8eaf0", fontSize: "13px", fontWeight: label === "Daily Rate" ? 600 : 400 }}>{value}</p>
                </div>
              ))}
            </div>
            {details.address && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "4px" }}>Address</p>
                <p style={{ color: "rgba(232,234,240,0.7)", fontSize: "13px" }}>{details.address}</p>
              </div>
            )}
            <div style={divider} />
            <p style={sectionTitle}>📅 Attendance Summary</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <StatBox label="Total Days (All Time)" value={`${details.totalDaysAllTime ?? 0} days`} color="#818cf8" />
              <StatBox label="This Month Days"       value={`${details.totalDaysThisMonth ?? 0} days`} color="#34d399" />
            </div>
            <div style={divider} />
            <p style={sectionTitle}>💰 Salary Summary</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              <StatBox label="Total Earned"   value={fmt(details.totalEarned)}     color="#fbbf24" />
              <StatBox label="Total Paid"     value={fmt(details.totalSalaryPaid)} color="#34d399" />
              <StatBox label="Remaining"      value={fmt(details.remainingSalary)} color={details.remainingSalary > 0 ? "#f87171" : "#34d399"} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.85rem" }}>
    <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px", marginBottom: "5px" }}>{label}</p>
    <p style={{ color, fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700 }}>{value}</p>
  </div>
);

// ── Header Component ──────────────────────────────────────────────────────────
const Header = ({ collapsed, isMobile = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [time, setTime]           = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("EMPLOYEE");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg]     = useState("");

  // Search state
  const [searchVal, setSearchVal]     = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);

  const profileRef = useRef(null);
  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  // ── Clock ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Debounced Search ──────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchService.search(val.trim());
        setSearchResults(results);
        setShowDropdown(true);
      } catch { setSearchResults(null); }
      finally { setSearchLoading(false); }
    }, 400);
  };

  const hasResults = searchResults && (
    searchResults.employees?.length > 0 ||
    searchResults.machines?.length > 0 ||
    searchResults.notes?.length > 0
  );

  const handleEmpClick = (id) => {
    setSelectedEmpId(id);
    setShowDropdown(false);
    setSearchVal("");
  };

  const handleMachineClick = () => {
    setShowDropdown(false);
    setSearchVal("");
    navigate("/admin/tools");
  };

  const handleNoteClick = () => {
    setShowDropdown(false);
    setSearchVal("");
    navigate("/admin/notes");
  };

  // ── Invite ────────────────────────────────────────────────────────────────
  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true); setInviteMsg("");
    try {
      await authService.sendInvite(inviteEmail, inviteRole);
      setInviteMsg("✅ Invite sent!");
      setInviteEmail("");
      setTimeout(() => { setShowInvite(false); setInviteMsg(""); }, 2000);
    } catch { setInviteMsg("❌ Failed. Check email config."); }
    finally { setInviteLoading(false); }
  };

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  const formatDate = (d) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const sidebarWidth = isMobile ? 68 : (collapsed ? 68 : 220);

  const headerStyle = {
    ...styles.header,
    left: sidebarWidth,
    right: 0,
    height: isMobile ? "auto" : "64px",
    minHeight: "64px",
    padding: isMobile ? "0.9rem 1rem" : "0 1.5rem",
    gap: isMobile ? "0.75rem" : "1rem",
    flexWrap: isMobile ? "wrap" : "nowrap",
  };

  return (
    <>
      <header style={headerStyle}>

        {isMobile ? (
          <>
            <div style={styles.mobileTopRow}>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: "14px", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Admin"}</p>
                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{formatDate(time)} | {formatTime(time)}</p>
              </div>

              <div style={styles.mobileActionRow}>
                <button onClick={() => { setShowInvite(!showInvite); setShowProfile(false); }} style={styles.inviteBtn}>
                  + Invite
                </button>

                <div ref={profileRef} style={{ position: "relative" }}>
                  <button onClick={() => { setShowProfile(!showProfile); setShowInvite(false); }} style={styles.avatar}>
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </button>
                  {showProfile && (
                    <div style={{ ...styles.floatCard, right: 0, width: "min(220px, calc(100vw - 2rem))" }}>
                      <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{user?.name}</p>
                        <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{user?.email}</p>
                        <span style={styles.roleBadge}>{user?.role}</span>
                      </div>
                      <button onClick={() => { navigate("/admin/profile"); setShowProfile(false); }} style={styles.dropBtn}>👤 View / Edit Profile</button>
                      <button onClick={handleLogout} style={{ ...styles.dropBtn, color: "rgba(239,68,68,0.8)", marginTop: "4px" }}>← Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div ref={searchRef} style={{ position: "relative", width: "100%" }}>
              <div style={{ position: "relative", width: "100%" }}>
                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "rgba(232,234,240,0.3)" }}>🔍</span>
                <input
                  value={searchVal}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults && setShowDropdown(true)}
                  placeholder="Search employees, machines, notes..."
                  style={{ ...styles.searchInput, width: "100%", minWidth: 0, boxSizing: "border-box" }}
                />
                {searchLoading && (
                  <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "rgba(232,234,240,0.3)" }}>...</span>
                )}
              </div>

              {showDropdown && (
                <div style={{ ...styles.dropdown, width: "100%", minWidth: 0 }}>
                  {!hasResults ? (
                    <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "12px", padding: "0.75rem 1rem" }}>No results found</p>
                  ) : (
                    <>
                      {searchResults.employees?.length > 0 && (
                        <div>
                          <p style={styles.dropdownSection}>👥 Employees</p>
                          {searchResults.employees.map(emp => (
                            <button key={emp.id} onClick={() => handleEmpClick(emp.id)} style={{ ...styles.dropdownItem, alignItems: "flex-start", gap: "0.75rem" }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{emp.name}</p>
                                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>
                                  {emp.designation || "Employee"}{emp.siteName ? ` • ${emp.siteName}` : ""}
                                </p>
                              </div>
                              <span style={styles.viewTag}>View Details</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.machines?.length > 0 && (
                        <div>
                          <p style={styles.dropdownSection}>🔧 Machines</p>
                          {searchResults.machines.map(m => (
                            <button key={m.id} onClick={handleMachineClick} style={{ ...styles.dropdownItem, alignItems: "flex-start", gap: "0.75rem" }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{m.name}</p>
                                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>
                                  {m.toolCode ? `${m.toolCode} • ` : ""}{m.assignedToName ? `Assigned: ${m.assignedToName}` : m.status}
                                </p>
                              </div>
                              <span style={{ ...styles.viewTag, color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}>View</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.notes?.length > 0 && (
                        <div>
                          <p style={styles.dropdownSection}>📝 Notes</p>
                          {searchResults.notes.map(n => (
                            <button key={n.id} onClick={handleNoteClick} style={{ ...styles.dropdownItem, alignItems: "flex-start", gap: "0.75rem" }}>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{n.title}</p>
                                {n.siteName && <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>📍 {n.siteName}</p>}
                              </div>
                              <span style={{ ...styles.viewTag, color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" }}>View</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* ── Admin Name + DateTime ── */}
            <div style={{ flexShrink: 0 }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: "14px", lineHeight: 1.2 }}>{user?.name || "Admin"}</p>
              <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{formatDate(time)} | {formatTime(time)}</p>
            </div>

            <div style={{ flex: 1 }} />

            {/* ── Global Search ── */}
            <div ref={searchRef} style={{ position: "relative" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "rgba(232,234,240,0.3)" }}>🔍</span>
                <input
                  value={searchVal}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults && setShowDropdown(true)}
                  placeholder="Search employees, machines, notes..."
                  style={styles.searchInput}
                />
                {searchLoading && (
                  <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "rgba(232,234,240,0.3)" }}>...</span>
                )}
              </div>

              {/* ── Search Dropdown ── */}
              {showDropdown && (
                <div style={styles.dropdown}>
                  {!hasResults ? (
                    <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "12px", padding: "0.75rem 1rem" }}>No results found</p>
                  ) : (
                    <>
                      {/* Employees */}
                      {searchResults.employees?.length > 0 && (
                        <div>
                          <p style={styles.dropdownSection}>👥 Employees</p>
                          {searchResults.employees.map(emp => (
                            <button key={emp.id} onClick={() => handleEmpClick(emp.id)} style={styles.dropdownItem}>
                              <div>
                                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{emp.name}</p>
                                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>
                                  {emp.designation || "Employee"}{emp.siteName ? ` • ${emp.siteName}` : ""}
                                </p>
                              </div>
                              <span style={styles.viewTag}>View Details</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Machines */}
                      {searchResults.machines?.length > 0 && (
                        <div>
                          <p style={styles.dropdownSection}>🔧 Machines</p>
                          {searchResults.machines.map(m => (
                            <button key={m.id} onClick={handleMachineClick} style={styles.dropdownItem}>
                              <div>
                                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{m.name}</p>
                                <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>
                                  {m.toolCode ? `${m.toolCode} • ` : ""}{m.assignedToName ? `Assigned: ${m.assignedToName}` : m.status}
                                </p>
                              </div>
                              <span style={{ ...styles.viewTag, color: "#34d399", borderColor: "rgba(52,211,153,0.3)" }}>View</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {searchResults.notes?.length > 0 && (
                        <div>
                          <p style={styles.dropdownSection}>📝 Notes</p>
                          {searchResults.notes.map(n => (
                            <button key={n.id} onClick={handleNoteClick} style={styles.dropdownItem}>
                              <div>
                                <p style={{ color: "#e8eaf0", fontSize: "13px", fontWeight: 500 }}>{n.title}</p>
                                {n.siteName && <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>📍 {n.siteName}</p>}
                              </div>
                              <span style={{ ...styles.viewTag, color: "#fbbf24", borderColor: "rgba(251,191,36,0.3)" }}>View</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Invite Button ── */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowInvite(!showInvite); setShowProfile(false); }} style={styles.inviteBtn}>
                + Invite
              </button>
              {showInvite && (
                <div style={styles.floatCard}>
                  <p style={styles.floatTitle}>Send Invite</p>
                  <input type="email" placeholder="Email address" value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)} style={styles.floatInput} />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    style={{ ...styles.floatInput, marginTop: "8px" }}>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  {inviteMsg && <p style={{ fontSize: "12px", color: inviteMsg.startsWith("✅") ? "#34d399" : "#f87171", marginTop: "6px" }}>{inviteMsg}</p>}
                  <button onClick={handleSendInvite} disabled={inviteLoading} style={styles.floatBtn}>
                    {inviteLoading ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Profile ── */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button onClick={() => { setShowProfile(!showProfile); setShowInvite(false); }} style={styles.avatar}>
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </button>
              {showProfile && (
                <div style={styles.floatCard}>
                  <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>{user?.name}</p>
                    <p style={{ color: "rgba(232,234,240,0.4)", fontSize: "11px" }}>{user?.email}</p>
                    <span style={styles.roleBadge}>{user?.role}</span>
                  </div>
                  <button onClick={() => { navigate("/admin/profile"); setShowProfile(false); }} style={styles.dropBtn}>👤 View / Edit Profile</button>
                  <button onClick={handleLogout} style={{ ...styles.dropBtn, color: "rgba(239,68,68,0.8)", marginTop: "4px" }}>← Logout</button>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      {/* ── Employee Details Modal ── */}
      {selectedEmpId && (
        <DetailsModal empId={selectedEmpId} onClose={() => setSelectedEmpId(null)} />
      )}
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  header: {
    position: "fixed", top: 0, right: 0, height: "64px",
    background: "rgba(10,15,30,0.95)", borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(10px)", display: "flex", alignItems: "center",
    padding: "0 1.5rem", gap: "1rem", zIndex: 40, transition: "left 0.25s ease",
    fontFamily: "'DM Sans', sans-serif",
  },
  mobileTopRow: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  mobileActionRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexShrink: 0,
  },
  searchInput: {
    background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "10px", padding: "7px 12px 7px 32px", color: "#e8eaf0",
    fontSize: "13px", outline: "none", width: "280px", fontFamily: "'DM Sans', sans-serif",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
    background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "14px", zIndex: 300, maxHeight: "380px", overflowY: "auto",
    minWidth: "320px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  dropdownSection: {
    color: "rgba(232,234,240,0.35)", fontSize: "10px", fontWeight: 600,
    letterSpacing: "0.8px", textTransform: "uppercase", padding: "8px 12px 4px",
  },
  dropdownItem: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 12px", background: "transparent", border: "none",
    cursor: "pointer", textAlign: "left", borderRadius: "8px",
    transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif",
  },
  viewTag: {
    fontSize: "10px", padding: "2px 8px", borderRadius: "20px", flexShrink: 0,
    border: "0.5px solid rgba(99,102,241,0.3)", color: "#818cf8", fontWeight: 600,
  },
  inviteBtn: {
    background: "rgba(99,102,241,0.15)", border: "0.5px solid rgba(99,102,241,0.35)",
    borderRadius: "10px", padding: "7px 14px", color: "#a5b4fc",
    fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: "linear-gradient(135deg,#6366f1,#818cf8)", border: "none",
    cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: "14px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  floatCard: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "14px", padding: "1rem", width: "220px", maxWidth: "calc(100vw - 2rem)", zIndex: 200,
  },
  floatTitle: { color: "#fff", fontWeight: 600, fontSize: "13px", marginBottom: "0.75rem" },
  floatInput: {
    width: "100%", padding: "7px 10px", borderRadius: "8px",
    border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
    color: "#e8eaf0", fontSize: "12px", outline: "none", fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
  },
  floatBtn: {
    marginTop: "10px", width: "100%", padding: "8px", borderRadius: "8px",
    border: "none", background: "linear-gradient(90deg,#6366f1,#818cf8)",
    color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  roleBadge: {
    display: "inline-block", marginTop: "4px", fontSize: "10px", padding: "2px 8px",
    borderRadius: "10px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc",
    border: "0.5px solid rgba(99,102,241,0.3)",
  },
  dropBtn: {
    display: "block", width: "100%", padding: "8px 10px",
    background: "transparent", border: "none", color: "rgba(232,234,240,0.6)",
    fontSize: "13px", cursor: "pointer", textAlign: "left", borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
  },
};

const modal = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(5,8,20,0.78)", zIndex: 400,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
  },
  box: {
    background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "18px", padding: "1.75rem", width: "100%", maxWidth: "620px",
    maxHeight: "90vh", overflowY: "auto", fontFamily: "'DM Sans', sans-serif",
  },
  title: { fontFamily: "'Sora',sans-serif", fontSize: "1rem", fontWeight: 700, color: "#fff" },
  closeBtn: { background: "none", border: "none", color: "rgba(232,234,240,0.4)", fontSize: "18px", cursor: "pointer" },
};

const sectionTitle = { color: "#e8eaf0", fontWeight: 600, fontSize: "13px", marginBottom: "0.75rem" };
const divider      = { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "1.25rem 0" };
const emptyTxt     = { color: "rgba(232,234,240,0.3)", fontSize: "13px", textAlign: "center", padding: "1rem" };

export default Header;
