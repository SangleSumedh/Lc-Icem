import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/Admin/AdminNavbar";
import AdminSidebar from "../components/Admin/AdminSidebar";

function Admin() {
  const [collapsed, setCollapsed] = useState(false); // 🔹 add state

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 h-20 z-50">
        <AdminNavbar />
      </div>

      <div className="flex flex-1 pt-20">
        {/* Fixed Sidebar */}
        <div className="fixed top-20 left-0 h-[calc(100vh-80px)] z-40">
          <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content (scrollable) */}
        <main
          className={`${collapsed ? " md:ml-20" : "md:ml-64"} flex-1 overflow-y-auto p-6 transition-all duration-300`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Admin;
