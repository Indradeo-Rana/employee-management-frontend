import { useState, useEffect } from "react";

// ─── Login Modal Component ────────────────────────────────────────────────────
const LoginModal = ({ role, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAdmin = role === "admin";

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // ── API Call to Spring Boot Backend ──
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Store JWT Token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess(true);

      // Redirect based on role
      setTimeout(() => {
        if (data.role === "SUPER_ADMIN" || data.role === "ADMIN") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/employee/dashboard";
        }
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,8,20,0.78)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Box */}
      <div
        className="w-full max-w-sm rounded-2xl p-8 relative"
        style={{
          background: "#0e1428",
          border: "0.5px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Success State */}
        {success ? (
          <div className="text-center py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{
                background: isAdmin
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(16,185,129,0.12)",
                border: isAdmin
                  ? "0.5px solid rgba(99,102,241,0.3)"
                  : "0.5px solid rgba(16,185,129,0.28)",
              }}
            >
              {isAdmin ? "🛠️" : "👤"}
            </div>
            <p className="text-white font-bold text-lg font-sora mb-1">
              {isAdmin ? "Welcome, Admin!" : "Welcome back!"}
            </p>
            <p className="text-sm mb-4" style={{ color: "rgba(232,234,240,0.45)" }}>
              {isAdmin
                ? "Redirecting to Admin Dashboard..."
                : "Redirecting to Employee Dashboard..."}
            </p>
            <div
              className="h-1 rounded-full overflow-hidden mx-auto"
              style={{ background: "rgba(255,255,255,0.08)", maxWidth: "200px" }}
            >
              <div
                className="h-full rounded-full transition-all duration-[1800ms] ease-linear"
                style={{
                  width: "100%",
                  background: isAdmin
                    ? "linear-gradient(90deg,#6366f1,#818cf8)"
                    : "linear-gradient(90deg,#059669,#34d399)",
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-1"
                  style={{ color: isAdmin ? "#818cf8" : "#34d399" }}
                >
                  {isAdmin ? "Admin Portal" : "Employee Portal"}
                </p>
                <h2
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {isAdmin ? "Admin Sign In" : "Employee Sign In"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(232,234,240,0.5)",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "rgba(232,234,240,0.5)" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `0.5px solid ${
                      error
                        ? "rgba(239,68,68,0.5)"
                        : isAdmin
                        ? "rgba(99,102,241,0.25)"
                        : "rgba(16,185,129,0.25)"
                    }`,
                    color: "#e8eaf0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "rgba(232,234,240,0.5)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `0.5px solid ${
                      error
                        ? "rgba(239,68,68,0.5)"
                        : isAdmin
                        ? "rgba(99,102,241,0.25)"
                        : "rgba(16,185,129,0.25)"
                    }`,
                    color: "#e8eaf0",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              {error && (
                <p
                  className="text-xs text-center"
                  style={{ color: "rgba(239,68,68,0.85)" }}
                >
                  {error}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span className="text-xs" style={{ color: "rgba(232,234,240,0.28)" }}>
                  Invite-only access
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{
                  background: isAdmin
                    ? "linear-gradient(90deg,#6366f1,#818cf8)"
                    : "linear-gradient(90deg,#059669,#34d399)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
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

// ─── Main Landing Page Component ─────────────────────────────────────────────
const LandingPage = () => {
  const [activeModal, setActiveModal] = useState(null); // null | 'admin' | 'employee'

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "#0a0f1e",
        color: "#e8eaf0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Background Effects ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,120,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,120,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-120px",
          left: "-120px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-100px",
          right: "-100px",
          width: "450px",
          height: "450px",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      {/* ── Page Content ── */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>

        {/* ── Navbar ── */}
        <nav
          className="flex items-center justify-between px-10 py-5 sticky top-0"
          style={{
            borderBottom: "0.5px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(10px)",
            background: "rgba(10,15,30,0.7)",
            zIndex: 100,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
              style={{
                background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              }}
            >
              🏢
            </div>
            <span
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px" }}
            >
              Sharma<span style={{ color: "#818cf8" }}>Enterprises</span>
            </span>
          </div>
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "0.5px solid rgba(99,102,241,0.35)",
              color: "#a5b4fc",
              letterSpacing: "0.3px",
            }}
          >
            ● System Active
          </span>
        </nav>

        {/* ── Hero Section ── */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

          {/* Pill Badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "0.5px solid rgba(16,185,129,0.3)",
              color: "#6ee7b7",
              letterSpacing: "0.5px",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981" }}
            />
            Secure • Role-Based • Invite-Only
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Sora', sans-serif", letterSpacing: "-0.5px" }}
          >
            Employee Management
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #818cf8, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Simplified & Secured
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base max-w-md mx-auto mb-14"
            style={{ color: "rgba(232,234,240,0.55)", lineHeight: 1.7 }}
          >
            A unified platform for managing your workforce — attendance,
            payroll, and access control, all in one place.
          </p>

          {/* ── Login Cards ── */}
          <div className="flex gap-6 justify-center flex-wrap w-full max-w-2xl mx-auto">

            {/* Admin Card */}
            <div
              className="flex-1 min-w-[280px] max-w-[340px] rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => setActiveModal("admin")}
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{
                  width: "52px",
                  height: "52px",
                  background: "rgba(99,102,241,0.15)",
                  border: "0.5px solid rgba(99,102,241,0.3)",
                }}
              >
                🛠️
              </div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "#818cf8" }}
              >
                Admin Portal
              </p>
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Admin Login
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "rgba(232,234,240,0.45)", lineHeight: 1.65 }}
              >
                Manage employees, track attendance, handle payroll and send
                invite links to your team.
              </p>
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(90deg,#6366f1,#818cf8)",
                }}
              >
                Login as Admin
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  →
                </span>
              </button>
            </div>

            {/* Employee Card */}
            <div
              className="flex-1 min-w-[280px] max-w-[340px] rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
              onClick={() => setActiveModal("employee")}
            >
              <div
                className="flex items-center justify-center text-2xl mb-5"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "rgba(16,185,129,0.12)",
                  border: "0.5px solid rgba(16,185,129,0.28)",
                }}
              >
                👤
              </div>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ color: "#34d399" }}
              >
                Employee Portal
              </p>
              <h3
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Employee Login
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "rgba(232,234,240,0.45)", lineHeight: 1.65 }}
              >
                View your attendance records, salary details and personal
                profile information.
              </p>
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(90deg,#059669,#34d399)",
                }}
              >
                Login as Employee
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  →
                </span>
              </button>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="flex items-center gap-10 mt-12 flex-wrap justify-center">
            {[
              { num: "JWT", label: "Secured Auth" },
              { num: "RBAC", label: "Role Based Access" },
              { num: "🔒", label: "Invite Only" },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-10">
                <div className="text-center">
                  <div
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {s.num}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{
                      color: "rgba(232,234,240,0.35)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="h-8 w-px"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer
          className="text-center py-6 text-xs"
          style={{
            color: "rgba(232,234,240,0.2)",
            borderTop: "0.5px solid rgba(255,255,255,0.04)",
          }}
        >
          &copy; 2025 NKManage — All rights reserved. Unauthorized access is prohibited.
        </footer>
      </div>

      {/* ── Login Modal ── */}
      {activeModal && (
        <LoginModal role={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default LandingPage;
