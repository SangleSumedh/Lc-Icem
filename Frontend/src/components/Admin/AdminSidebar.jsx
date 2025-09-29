import React, { useRef, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShoppingCart,
  Megaphone,
  GraduationCap,
  Briefcase,
  FileText,
  Bus,
  Home,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  ShieldPlus,
  Building2,
  Info,
  Clock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function AdminSidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const itemRefs = useRef({});
  const location = useLocation();

  const role = localStorage.getItem("role");
  const deptName = localStorage.getItem("deptName");

  const [departments, setDepartments] = useState([]);

  // 🔹 Fetch departments only if role is department
  useEffect(() => {
    if (role === "department") {
      fetch("http://localhost:5000/admin/departments")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDepartments(data.data);
          }
        })
        .catch((err) => console.error("Error fetching departments", err));
    }
  }, [role]);

  // ✅ Create slug for routes
  function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  let filteredDepartments = [];

  if (role === "student") {
    filteredDepartments = [
      { deptName: "Student Dashboard", path: "/student", icon: Home },
      { deptName: "Leaving Certificate", path: "/student/leaving-certificate", icon: FileText },
    ];
  } else if (role === "superadmin") {
    filteredDepartments = [
      { deptName: "Admin Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
      { deptName: "Add Department", path: "/admin-dashboard/add-department", icon: Building2 },
      { deptName: "Add User", path: "/admin-dashboard/add-user", icon: UserPlus },
      { deptName: "Add SuperAdmin", path: "/admin-dashboard/add-superadmin", icon: ShieldPlus },
    ];
  } else if (role === "department") {
    const storedDept = deptName?.toLowerCase();
    const matches = departments.filter((d) => d.deptName.toLowerCase() === storedDept);

    // show 2 entries for department:
    // 1) Pending Approvals
    // 2) Requested Info
    filteredDepartments = matches.flatMap((d) => {
      const base = `/admin-dashboard/${slugify(d.deptName)}`;
      return [
        {
          deptName: "Pending Approvals",
          path: base,
          icon: Clock,
        },
        {
          deptName: "Requested Info",
          path: `${base}/requested-info`,
          icon: Info,
        },
      ];
    });
  }

  useEffect(() => {
    const activeRef = itemRefs.current[location.pathname];
    if (activeRef) activeRef.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [location]);

  return (
    <div
      className={`${collapsed ? "w-20" : "w-64"} 
        h-[calc(100vh-80px)]
        rounded-r-2xl py-2
        bg-white shadow-lg flex flex-col 
        transition-all duration-300 
        overflow-y-auto`}
    >
      {/* Collapse Button */}
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 rounded-lg hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-2 space-y-2">
        {filteredDepartments.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon || Users;
          return (
            <div
              key={item.path}
              ref={(el) => (itemRefs.current[item.path] = el)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 cursor-pointer ${
                isActive ? "text-blue-600 bg-blue-50 font-semibold" : "hover:text-blue-400"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-6 h-6 text-[#00539C]" />
              {!collapsed && <span className="font-medium">{item.deptName}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 🔹 (kept for possible future use)
 */
function pickIcon(name) {
  if (name.toLowerCase().includes("account")) return DollarSign;
  if (name.toLowerCase().includes("library")) return Megaphone;
  if (name.toLowerCase().includes("hostel")) return ShoppingCart;
  if (name.toLowerCase().includes("alumni")) return GraduationCap;
  if (name.toLowerCase().includes("placement")) return Briefcase;
  if (name.toLowerCase().includes("scholarship")) return DollarSign;
  if (name.toLowerCase().includes("exam")) return FileText;
  if (name.toLowerCase().includes("bus")) return Bus;
  if (name.toLowerCase().includes("hod")) return Users;
  return Users;
}

export default AdminSidebar;
