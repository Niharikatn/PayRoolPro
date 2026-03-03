import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashBoard from "./pages/AdminDashBoard";
import EmployeeDashBoard from "./pages/EmployeeDashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRegister from "./pages/AdminRegister";
import EmployeeRegister from "./pages/EmployeeRegister";
import "./App.css";
function App() {
  return (
    <Routes>
      <Route path="/admin-register" element={<AdminRegister />} />
      <Route path="/employee-register" element={<EmployeeRegister />} />
      <Route path="/" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashBoard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee"
        element={
          <ProtectedRoute>
            <EmployeeDashBoard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;