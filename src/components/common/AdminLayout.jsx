import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 768);
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const effectiveCollapsed = isMobile ? true : collapsed;
  const sidebarWidth = effectiveCollapsed ? 68 : 220;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar collapsed={effectiveCollapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main area */}
      <div style={{ marginLeft: sidebarWidth, transition: "margin-left 0.25s ease" }}>
        {/* Header */}
        <Header collapsed={effectiveCollapsed} isMobile={isMobile} />

        {/* Page content */}
        <main style={{ padding: isMobile ? "1rem" : "1.5rem", paddingTop: isMobile ? "132px" : "80px", minHeight: "100vh" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
