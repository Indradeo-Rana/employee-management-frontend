import { useEffect, useState } from "react";
import employeePortalService from "../../services/employeeService";

const EmployeeProfile = () => {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });
  const [address,  setAddress]  = useState("");
  const [pwForm,   setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [editMsg,  setEditMsg]  = useState("");
  const [addrMsg,  setAddrMsg]  = useState("");
  const [pwMsg,    setPwMsg]    = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [pwLoading,   setPwLoading]   = useState(false);

  useEffect(() => {
    employeePortalService.getProfile()
      .then(data => {
        setProfile(data);
        setEditForm({ name: data.name, phone: data.phone || "" });
        setAddress(data.address || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditMsg("");
    try {
      const updated = await employeePortalService.updateProfile(editForm);
      setProfile(updated);
      setEditMsg("✅ Profile updated!");
      setTimeout(() => setEditMsg(""), 3000);
    } catch (err) {
      setEditMsg("❌ " + (err.response?.data?.message || "Update failed"));
    } finally { setEditLoading(false); }
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    setAddrLoading(true); setAddrMsg("");
    try {
      const updated = await employeePortalService.updateAddress(address);
      setProfile(updated);
      setAddrMsg("✅ Address updated!");
      setTimeout(() => setAddrMsg(""), 3000);
    } catch (err) {
      setAddrMsg("❌ " + (err.response?.data?.message || "Update failed"));
    } finally { setAddrLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg("❌ Passwords do not match"); return;
    }
    setPwLoading(true); setPwMsg("");
    try {
      await employeePortalService.changePassword(pwForm);
      setPwMsg("✅ Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwMsg(""), 3000);
    } catch (err) {
      setPwMsg("❌ " + (err.response?.data?.message || "Failed"));
    } finally { setPwLoading(false); }
  };

  if (loading) return <p style={emptyTxt}>Loading...</p>;

  const fmt = (n) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={pageTitle}>My Profile</h1>

      {/* ── Profile Info ── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={avatarBox}>
            {profile?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "18px" }}>{profile?.name}</p>
            <p style={{ color: "rgba(232,234,240,0.45)", fontSize: "13px" }}>{profile?.email}</p>
            {profile?.siteName && (
              <span style={siteBadge}>📍 {profile.siteName}</span>
            )}
          </div>
        </div>

        {/* Read-only info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[
            ["Designation", profile?.designation || "—"],
            ["Daily Rate",  fmt(profile?.dailyRate)],
            ["Joining Date", profile?.joiningDate || "—"],
            ["Site",        profile?.siteName || "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p style={{ color: "rgba(232,234,240,0.35)", fontSize: "11px", marginBottom: "2px" }}>{label}</p>
              <p style={{ color: label === "Daily Rate" ? "#fbbf24" : "rgba(232,234,240,0.6)", fontSize: "13px", fontWeight: label === "Daily Rate" ? 600 : 400 }}>{value}</p>
            </div>
          ))}
        </div>
        <p style={{ color: "rgba(232,234,240,0.3)", fontSize: "11px" }}>
          ℹ️ Designation, rate, and site can only be changed by admin.
        </p>

        <div style={divider} />

        {/* ── Edit Name + Phone ── */}
        <p style={sectionLabel}>Edit Profile</p>
        <form onSubmit={handleProfileSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label style={formLabel}>Full Name *</label>
              <input type="text" value={editForm.name} required
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                style={formInput} />
            </div>
            <div>
              <label style={formLabel}>Phone</label>
              <input type="text" value={editForm.phone} placeholder="+91 9876543210"
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                style={formInput} />
            </div>
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={formLabel}>Email (cannot be changed)</label>
            <input value={profile?.email} readOnly
              style={{ ...formInput, opacity: 0.5, cursor: "not-allowed" }} />
          </div>
          {editMsg && <p style={{ fontSize: "12px", color: editMsg.startsWith("✅") ? "#34d399" : "#f87171", marginBottom: "0.75rem" }}>{editMsg}</p>}
          <button type="submit" disabled={editLoading} style={primaryBtn}>
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* ── Address Card ── */}
      <div style={{ ...card, marginTop: "1.25rem" }}>
        <p style={sectionLabel}>📍 My Address</p>
        <form onSubmit={handleAddressSave}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={formLabel}>Address</label>
            <textarea value={address} rows={3}
              placeholder="Enter your full address..."
              onChange={e => setAddress(e.target.value)}
              style={{ ...formInput, resize: "vertical", minHeight: "80px" }} />
          </div>
          {addrMsg && <p style={{ fontSize: "12px", color: addrMsg.startsWith("✅") ? "#34d399" : "#f87171", marginBottom: "0.75rem" }}>{addrMsg}</p>}
          <button type="submit" disabled={addrLoading} style={primaryBtn}>
            {addrLoading ? "Saving..." : "Update Address"}
          </button>
        </form>
      </div>

      {/* ── Change Password Card ── */}
      <div style={{ ...card, marginTop: "1.25rem" }}>
        <p style={sectionLabel}>🔑 Change Password</p>
        <form onSubmit={handlePasswordSave}>
          {[
            { label: "Current Password",    key: "currentPassword" },
            { label: "New Password",         key: "newPassword" },
            { label: "Confirm New Password", key: "confirmPassword" },
          ].map(({ label, key }) => (
            <div key={key} style={{ marginBottom: "0.75rem" }}>
              <label style={formLabel}>{label}</label>
              <input type="password" value={pwForm[key]} required
                onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                style={formInput} />
            </div>
          ))}
          {pwMsg && <p style={{ fontSize: "12px", color: pwMsg.startsWith("✅") ? "#34d399" : "#f87171", marginBottom: "0.75rem" }}>{pwMsg}</p>}
          <button type="submit" disabled={pwLoading} style={primaryBtn}>
            {pwLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

const pageTitle   = { fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" };
const card        = { background: "#0e1428", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" };
const avatarBox   = { width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#34d399,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "22px", flexShrink: 0 };
const siteBadge   = { display: "inline-block", marginTop: "4px", fontSize: "10px", padding: "2px 10px", borderRadius: "20px", background: "rgba(52,211,153,0.12)", color: "#34d399", border: "0.5px solid rgba(52,211,153,0.25)" };
const divider     = { height: "0.5px", background: "rgba(255,255,255,0.07)", margin: "1.25rem 0" };
const sectionLabel = { color: "#e8eaf0", fontWeight: 600, fontSize: "13px", marginBottom: "1rem" };
const primaryBtn  = { background: "linear-gradient(90deg,#6366f1,#818cf8)", border: "none", borderRadius: "10px", padding: "9px 20px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" };
const formLabel   = { display: "block", fontSize: "12px", fontWeight: 500, color: "rgba(232,234,240,0.5)", marginBottom: "5px" };
const formInput   = { width: "100%", padding: "8px 12px", borderRadius: "9px", border: "0.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#e8eaf0", fontSize: "13px", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" };
const emptyTxt    = { color: "rgba(232,234,240,0.3)", fontSize: "14px", padding: "3rem", textAlign: "center" };

export default EmployeeProfile;
