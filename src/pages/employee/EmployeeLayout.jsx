import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeNavbar from "../../components/common/EmployeeNavbar";
import employeePortalService from "../../services/employeeService";
import { showError } from "../../utils/toastHelper";

const EmployeeLayout = () => {
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <EmployeeNavbar hasTools={hasTools} hasSite={hasSite} />

      {/* Page Content — below navbar */}
      <main className="mx-auto w-full max-w-[1100px] px-4 pb-8 pt-20 sm:px-6">
        {loaded ? <Outlet /> : (
          <p className="pt-16 text-center text-slate-400">
            Loading...
          </p>
        )}
      </main>
    </div>
  );
};

export default EmployeeLayout;
