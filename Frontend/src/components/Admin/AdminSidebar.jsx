import React, { useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShoppingCart,
  Megaphone,
  GraduationCap,
  Briefcase,
  ClipboardList,
  FileText,
  Bus,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function AdminSidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const itemRefs = useRef({});
  const location = useLocation();

  const role = localStorage.getItem("role");
  const deptName = localStorage.getItem("deptName");

  const departments = [
    { name: "Admin", icon: LayoutDashboard, path: "/admin-dashboard", roles: ["superadmin"] },
    { name: "Accounts", icon: DollarSign, path: "/admin-dashboard/account", roles: ["department"], dept: "account" },
    { name: "Hostel", icon: ShoppingCart, path: "/admin-dashboard/hostel", roles: ["department"], dept: "hostel" },
    { name: "Library", icon: Megaphone, path: "/admin-dashboard/library", roles: ["department"], dept: "library" },
    { name: "Alumni Co-ordinator", icon: GraduationCap, path: "/admin-dashboard/alumni", roles: ["department"], dept: "alumni" },
    { name: "Central Placement Department", icon: Briefcase, path: "/admin-dashboard/placement", roles: ["department"], dept: "placement" },
    { name: "Department Placement Co-ordinator", icon: ClipboardList, path: "/admin-dashboard/department-placement", roles: ["department"], dept: "department-placement" },
    { name: "Scholarship", icon: DollarSign, path: "/admin-dashboard/scholarship", roles: ["department"], dept: "scholarship" },
    { name: "Exam Section", icon: FileText, path: "/admin-dashboard/exam", roles: ["department"], dept: "exam" },
    { name: "Bus", icon: Bus, path: "/admin-dashboard/bus", roles: ["department"], dept: "bus" },
  ];

  const hods = [
    "computer-science", "it", "mechanical", "civil", "entc",
    "electrical", "aids", "aime", "mba", "mca",
    "chemical", "biotech", "mechatronics"
  ];
  hods.forEach(branch => {
    departments.push({
      name: `HOD - ${branch.replace(/-/g, " ").toUpperCase()}`,
      icon: Users,
      path: `/admin-dashboard/hod-${branch}`,
      roles: ["department"],
      dept: `hod-${branch}`,
    });
  });

  let filteredDepartments = [];
  if (role === "student") {
    filteredDepartments = [
      { name: "Student Dashboard", path: "/student", icon: Home },
      { name: "Leaving Certificate", path: "/student/leaving-certificate", icon: FileText },
    ];
  } else if (role === "superadmin") {
    filteredDepartments = departments.filter(d => d.roles.includes("superadmin"));
  } else if (role === "department") {
    const storedDept = deptName?.toLowerCase().replace(/\s+/g, "-");
    filteredDepartments = departments.filter(
      (d) =>
        d.roles.includes("department") &&
        d.dept?.toLowerCase().replace(/\s+/g, "-") === storedDept
    );
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
        {filteredDepartments.map((dept) => {
          const isActive = location.pathname === dept.path;
          const Icon = dept.icon;
          return (
            <div
              key={dept.name}
              ref={(el) => (itemRefs.current[dept.path] = el)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 cursor-pointer ${
                isActive ? "text-blue-600 bg-blue-50 font-semibold" : "hover:text-blue-400"
              }`}
              onClick={() => navigate(dept.path)}
            >
              <Icon className="w-6 h-6 text-[#00539C]" />
              {!collapsed && <span className="font-medium">{dept.name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminSidebar;
