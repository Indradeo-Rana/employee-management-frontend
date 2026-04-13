import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import EmployeeNavbar from "../../components/common/EmployeeNavbar";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const EmployeeLayout = () => {
  const navigate  = useNavigate();
  const [hasTools, setHasTools] = useState(false);
  const [hasSite,  setHasSite]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    // Fetch home stats to decide which tabs to show
    employeePortalService.getHome()
      .then(data => {
        setHasTools(data.assignedToolsCount > 0);
        setHasSite(!!data.siteName);
      })
      .catch(err => showError(err.response?.data?.message || "Failed to load home data"))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Top Navbar */}
      <EmployeeNavbar hasTools={hasTools} hasSite={hasSite} />

      {/* Page Content — below navbar */}
      <main style={{
        paddingTop: "76px",
        padding: "76px 1.5rem 2rem",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        {loaded ? <Outlet /> : (
          <p style={{ color: "rgba(232,234,240,0.4)", textAlign: "center", paddingTop: "4rem" }}>
            Loading...
          </p>
        )}
      </main>
    </div>
  );
};

export default EmployeeLayout;
