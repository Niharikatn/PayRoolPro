import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // Not logged in → go to login
  if (!role || !token) {
    return <Navigate to="/" />;
  }

  const roleLower = role.toLowerCase();

  // Admin trying to access /employee
  if (location.pathname === "/admin" && roleLower !== "admin") {
    return <Navigate to="/employee" />;
  }

  // Employee trying to access /admin
  if (location.pathname === "/employee" && roleLower !== "employee") {
    return <Navigate to="/admin" />;
  }

  return children;
}

export default ProtectedRoute;