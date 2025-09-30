import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoutes = ({ allowedRoles, redirectTo }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // ❌ Not logged in → redirect
    return <Navigate to={redirectTo} replace />;
  }

  try {
    // ✅ Token validity check
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      localStorage.clear();
      return <Navigate to={redirectTo} replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.clear();
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.includes(role)) {
    // ❌ Wrong role → block access
    return <Navigate to={redirectTo} replace />;
  }

  // ✅ Authorized → render nested route
  return <Outlet />;
};

export default ProtectedRoutes;
