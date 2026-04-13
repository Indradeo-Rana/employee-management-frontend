import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ── Props ──────────────────────────────────────────────────────────────────────
// allowedRoles: array of roles that can access this route
// e.g. allowedRoles={["ADMIN", "SUPER_ADMIN"]}

const PrivateRoute = ({ allowedRoles }) => {
  const { isLoggedIn, user } = useAuth();

  // Not logged in → redirect to landing
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "EMPLOYEE" ? "/employee/dashboard" : "/admin/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed → render the protected page
  return <Outlet />;
};

export default PrivateRoute;
