import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/common/PrivateRoute";
import AdminLayout from "./components/common/AdminLayout";

// Auth pages
import LandingPage  from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage  from "./pages/ForgotPasswordPage";


// Admin pages
import DashboardHome  from "./pages/admin/DashboardHome";
import EmployeesPage  from "./pages/admin/EmployeesPage";
import AttendancePage from "./pages/admin/AttendancePage";
import PaymentPage    from "./pages/admin/PaymentPage";
import ToolsPage      from "./pages/admin/ToolsPage";
import ReportsPage    from "./pages/admin/ReportsPage";
import NotesPage      from "./pages/admin/NotesPage";
import AdminProfile   from "./pages/admin/AdminProfile";


// Employee pages
import EmployeeLayout     from "./pages/employee/EmployeeLayout";
import EmployeeHome       from "./pages/employee/EmployeeHome";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import EmployeePayroll    from "./pages/employee/EmployeePayroll";
import EmployeeMachines   from "./pages/employee/EmployeeMachines";
import EmployeeSite       from "./pages/employee/EmployeeSite";
import EmployeeProfile    from "./pages/employee/EmployeeProfile";


// ── Root redirect ─────────────────────────────────────────────────────────────
const RootRedirect = () => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <LandingPage />;
  if (user?.role === "EMPLOYEE") return <Navigate to="/employee/home" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

// ── All Routes ────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>

    {/* ── Public ── */}
    <Route path="/"         element={<RootRedirect />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />


    {/* ── Admin Routes (Sidebar + Header layout) ── */}
    <Route element={<PrivateRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard"  element={<DashboardHome />} />
        <Route path="/admin/employees"  element={<EmployeesPage />} />
        <Route path="/admin/attendance" element={<AttendancePage />} />
        <Route path="/admin/payment"    element={<PaymentPage />} />
        <Route path="/admin/tools"      element={<ToolsPage />} />
        <Route path="/admin/reports"    element={<ReportsPage />} />
        <Route path="/admin/notes"      element={<NotesPage />} />
        <Route path="/admin/profile"    element={<AdminProfile />} />
      </Route>
    </Route>

    {/* ── Employee Routes (Horizontal Navbar layout) ── */}
    <Route element={<PrivateRoute allowedRoles={["EMPLOYEE"]} />}>
      <Route element={<EmployeeLayout />}>
        <Route path="/employee/home"       element={<EmployeeHome />} />
        <Route path="/employee/attendance" element={<EmployeeAttendance />} />
        <Route path="/employee/payroll"    element={<EmployeePayroll />} />
        <Route path="/employee/machines"   element={<EmployeeMachines />} />
        <Route path="/employee/site"       element={<EmployeeSite />} />
        <Route path="/employee/profile"    element={<EmployeeProfile />} />


      </Route>
    </Route>

    {/* Old /employee/dashboard redirect to new home */}
    <Route path="/employee/dashboard" element={<Navigate to="/employee/home" replace />} />

    {/* ── Catch-all ── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    <AppRoutes />
  </AuthProvider>
);

export default App;
