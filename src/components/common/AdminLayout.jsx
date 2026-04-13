import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 68 : 220;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main area */}
      <div style={{ marginLeft: sidebarWidth, transition: "margin-left 0.25s ease" }}>
        {/* Header */}
        <Header collapsed={collapsed} />

        {/* Page content */}
        <main style={{ padding: "1.5rem", paddingTop: "80px", minHeight: "100vh" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
