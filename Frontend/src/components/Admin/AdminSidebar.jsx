import React, { useRef, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  Home,
  ChevronLeft,
  ChevronRight,
  TicketCheck,
  Building2,
  Clock,
} from "lucide-react";
import { FaBuilding } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminSidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const itemRefs = useRef({});
  const location = useLocation();

  const role = localStorage.getItem("role");
  const deptName = localStorage.getItem("deptName");

  const [departments, setDepartments] = useState([]);

  // 🔹 Fetch departments only if role is department
  useEffect(() => {
    const fetchDepartments = async () => {
      if (role === "department") {
        try {
          const response = await axios.get(
            "http://localhost:5000/admin/departments"
          );
          if (response.data.success) {
            setDepartments(response.data.data);
          }
        } catch (err) {
          console.error("Error fetching departments", err);
        }
      }
    };
    fetchDepartments();
  }, [role]);

  // ✅ Create slug for routes
  function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  let filteredDepartments = [];

  if (role === "student") {
    filteredDepartments = [
      { deptName: "Student Dashboard", path: "/student", icon: Home },
      {
        deptName: "Leaving Certificate",
        path: "/student/leaving-certificate",
        icon: FileText,
      },
      {
        deptName: "Help",
        path: "/student/raise-tickets",
        icon: Megaphone,
      },
    ];
  } else if (role === "superadmin") {
    filteredDepartments = [
      {
        deptName: "Admin Dashboard",
        path: "/admin-dashboard",
        icon: LayoutDashboard,
      },
      {
        deptName: "Tickets",
        path: "/admin-dashboard/registrar/raised-tickets",
        icon: TicketCheck,
      },
    ];
  } else if (role === "department") {
    const storedDept = deptName?.toLowerCase();
    const matches = departments.filter(
      (d) => d.deptName.toLowerCase() === storedDept
    );

    filteredDepartments = matches.flatMap((d) => {
      const base = `/admin-dashboard/${slugify(d.deptName)}`;

      if (d.deptName.toLowerCase() === "registrar") {
        return [
          { deptName: "Pending Approvals", path: base, icon: Clock },
          {
            deptName: "Tickets",
            path: `${base}/raised-tickets`,
            icon: TicketCheck,
          },
        ];
      }

      return [
        { deptName: `${d.deptName} Dashboard`, path: base, icon: FaBuilding },
      ];
    });
  }

  useEffect(() => {
    const activeRef = itemRefs.current[location.pathname];
    if (activeRef)
      activeRef.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [location]);

  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"} 
        h-[calc(100vh-80px)]
        rounded-r-sm py-2
        bg-white shadow-lg flex flex-col 
        border-r border-gray-200
        transition-all duration-300 
        overflow-y-auto`}
    >
      {/* Header with Toggle Button */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00539C] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span className="font-semibold text-gray-800">
                Leaving Certificate
              </span>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-lg cursor-pointer transition-all duration-200 
              border border-gray-300 bg-white hover:bg-gray-50 
              ${collapsed ? "" : "hover:shadow-sm"}`}
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-gray-600" />
            ) : (
              <ChevronLeft size={18} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Project name shown when collapsed */}
        {collapsed && (
          <div className="mt-3 flex justify-center">
            <div className="w-10 h-10 bg-[#00539C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LC</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-3 space-y-1 mt-4">
        {filteredDepartments.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon || Users;
          return (
            <div
              key={item.path}
              ref={(el) => (itemRefs.current[item.path] = el)}
              className={`flex items-center p-3 space-x-1 text-center rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[#00539C] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              />
              {!collapsed && (
                <span
                  className={`font-medium ${
                    isActive ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item.deptName}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminSidebar;
