import React from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./Admin/AdminNavbar";

function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <AdminNavbar />
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Page Not Found</p>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
          className="bg-[#005378] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {window.history.length > 1 ? "Go Back":"Go Home"}
        </button>
      </div>
    </>
  );
}

export default NotFound;
