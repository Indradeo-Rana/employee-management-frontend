import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const EmployeeNavbar = ({ hasTools, hasSite }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };
  const goTo = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: "Home",       path: "/employee/home",       icon: "🏠", always: true  },
    { label: "Attendance", path: "/employee/attendance",  icon: "📅", always: true  },
    { label: "Payroll",    path: "/employee/payroll",     icon: "💰", always: true  },
    { label: "Machines",   path: "/employee/machines",    icon: "🔧", always: false, show: hasTools },
    { label: "Site",       path: "/employee/site",        icon: "📍", always: false, show: hasSite  },
  ].filter(item => item.always || item.show);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center gap-3 px-4 sm:px-6">
        <button onClick={() => goTo("/employee/home")} className="flex items-center gap-2" title="Go to home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm">🏢</span>
          <span className="font-['Sora'] text-base font-bold text-white">
            NK<span className="text-indigo-300">Manage</span>
          </span>
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                className={`flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm transition ${isActive ? "bg-indigo-500/15 text-indigo-300" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <button
            onClick={() => goTo("/employee/profile")}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5"
            title="View / Edit Profile"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-xs font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "E"}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-xs font-semibold text-slate-100">{user?.name || "Employee"}</span>
              <span className="block text-[10px] text-slate-400">Edit Profile</span>
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/15"
          >
            Logout
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            onClick={() => goTo("/employee/profile")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-xs font-bold text-white"
            title="View / Edit Profile"
          >
            {user?.name?.charAt(0)?.toUpperCase() || "E"}
          </button>

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-slate-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-3 md:hidden">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-indigo-500/15 text-indigo-300" : "bg-white/5 text-slate-200"}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="mt-1 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default EmployeeNavbar;
