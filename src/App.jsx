import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

const AdminDashboard = () => <div className="p-6">Admin Dashboard</div>;
const EmployeeDashboard = () => <div className="p-6">Employee Dashboard</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
    </Routes>
  );
}

export default App;