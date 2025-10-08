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
  Clock,
  HamburgerIcon,
  Menu
} from "lucide-react";
import { FaBuilding } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ENV from "../../env.js";

function AdminSidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const itemRefs = useRef({});
  const role = localStorage.getItem("role");
  const deptName = localStorage.getItem("deptName");

  const [departments, setDepartments] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false); // For mobile sidebar

  // Fetch departments if role is department
  useEffect(() => {
    const fetchDepartments = async () => {
      if (role === "department") {
        try {
          const response = await axios.get(
            `${ENV.BASE_URL}/admin/departments` ||
              "http://localhost:5000/admin/departments"
          );
          const { success, data } = response.data;
          if (success) setDepartments(data?.departments || data || []);
        } catch (err) {
          console.error("Error fetching departments", err);
        }
      }
    };
    fetchDepartments();
  }, [role]);

  function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  // Filter menu items based on role
  let filteredDepartments = [];
  if (role === "student") {
    filteredDepartments = [
      { deptName: "Student Dashboard", path: "/student", icon: Home },
      {
        deptName: "Leaving Certificate",
        path: "/student/leaving-certificate",
        icon: FileText,
      },
      { deptName: "Help", path: "/student/raise-tickets", icon: Megaphone },
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
    <>
      {/* Desktop Sidebar */}
      <div
        className={`${collapsed ? "w-20" : "w-64"} hidden md:flex 
          h-[calc(100vh-80px)]
          rounded-r-sm py-2
          bg-white shadow-lg flex-col 
          border-r border-gray-200
          transition-all duration-300 
          overflow-y-auto`}
      >
        {/* Header */}
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
              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border border-gray-300 bg-white hover:bg-gray-50 ${
                collapsed ? "" : "hover:shadow-sm"
              }`}
            >
              {collapsed ? (
                <ChevronRight size={18} className="text-gray-600" />
              ) : (
                <ChevronLeft size={18} className="text-gray-600" />
              )}
            </button>
          </div>
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
                className={`flex items-center p-3 space-x-1 rounded-lg cursor-pointer transition-all duration-200 ${
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

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-20 left-0 h-[calc(100vh-80px)] w-full bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 flex justify-between items-center">
          <span className="font-semibold">{" "}</span>
          <button className="p-2 h-12">
            
          </button>
        </div>

        {/* Mobile Menu Items */}
        <div className="px-3 space-y-1 mt-4">
          {filteredDepartments.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon || Users;
            return (
              <div
                key={item.path}
                className={`flex items-center gap-5 p-3 space-x-1 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-[#00539C] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false); // Close sidebar after navigation
                }}
              >
                <Icon
                  className={`w-7 h-7 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />
                <span className="font-xl ">{item.deptName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <div className="md:hidden absolute top-3 left-3 z-50">
        <button
          onClick={() => {
            mobileOpen ? setMobileOpen(false) : setMobileOpen(true)}}
          className="border border-gray-300 bg-white/70 text-black p-3 rounded-full shadow-lg"
        >
          <Menu size={20} />
        </button>
      </div>
    </>
  );
}

export default AdminSidebar;
