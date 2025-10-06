import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Building2,
  Shield,
  X,
} from "lucide-react";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";

// ✅ Utility to generate safe slugs
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/^hod[-_\s]*/i, "hod-")
    .replace(/[\s_/]+/g, "-")
    .replace(/-+/g, "-");

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown state
  const [loginType, setLoginType] = useState("department");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const loginOptions = [
    {
      value: "department",
      label: "Department",
      description: "Login for department staff",
      icon: <Building2 className="w-4 h-4 text-[#00539C]" />,
    },
    {
      value: "superadmin",
      label: "Admin",
      description: "Full administrative access",
      icon: <Shield className="w-4 h-4 text-[#00539C]" />,
    },
  ];

  const selectedLogin = loginOptions.find((opt) => opt.value === loginType);

  const handleLoginSelect = (option) => {
    setLoginType(option.value);
    setDropdownOpen(false);
    if (formErrors.loginType) {
      setFormErrors({ ...formErrors, loginType: false });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: false });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {
      loginType: !loginType,
      email: !formData.email,
      password: !formData.password,
    };
    setFormErrors(errors);

    if (!errors.email && !errors.password && !errors.loginType) {
      try {
        setLoading(true);
        const url =
          loginType === "superadmin"
            ? "http://localhost:5000/auth/admin/login"
            : "http://localhost:5000/auth/department/login";

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);

          const decoded = jwtDecode(data.token);
          localStorage.setItem("role", decoded.role);

          if (decoded.role === "superadmin") {
            toast.success("Admin login successful!");
            navigate("/admin-dashboard");
          } else if (decoded.role === "department") {
            const deptName = decoded.deptName;
            localStorage.setItem("deptName", deptName);

            const slug = slugify(deptName);
            toast.success(`Welcome ${deptName} Department!`);
            navigate(`/admin-dashboard/${slug}`);
          }
        } else {
          toast.error(data.error || "Login failed");
        }
      } catch (err) {
        console.error("❌ Network error:", err);
        toast.error("Could not connect to backend.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout
      currentPage="admin"
      title="Leaving Certificate Portal"
      description="Admin and Department panel for managing Leaving Certificate applications at ICEM."
      points={[
        "Admin access",
        "Department-based logins",
        "Application management dashboard",
      ]}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#003C84]">Admin Login</h2>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back! Please log in to continue.
        </p>
      </div>

      {/* Login Type Dropdown */}
      <div className="mb-6 relative w-full" ref={dropdownRef}>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Login As
        </label>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition ${
            dropdownOpen ? "border-[#003C84]" : "border-[#00539C]"
          } bg-white`}
        >
          <div className="flex items-center space-x-2">
            {selectedLogin ? (
              selectedLogin.icon
            ) : (
              <Building2 className="w-4 h-4 text-[#00539C]" />
            )}
            <span
              className={
                selectedLogin
                  ? "text-gray-800 text-sm"
                  : "text-gray-400 text-sm"
              }
            >
              {selectedLogin ? selectedLogin.label : "Select Login Type"}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {dropdownOpen && (
          <div className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-scaleIn">
            {loginOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleLoginSelect(option)}
                className="group px-3 py-2 flex items-center space-x-2 cursor-pointer transition rounded-md hover:bg-[#00539C] hover:text-white"
              >
                {option.icon}
                <div className="flex flex-col">
                  <span className="text-sm font-medium group-hover:text-white">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-white">
                    {option.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {formErrors.loginType && (
          <p className="text-xs text-red-500 mt-1">
            Please select a login type
          </p>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="space-y-6 w-full max-w-md mx-auto"
      >
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3">
            <User className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="text"
              name="email"
              placeholder="e.g. adminuser"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full text-base outline-none"
            />
          </div>
          {formErrors.email && (
            <p className="text-sm text-red-500 mt-1">Email id is required</p>
          )}
        </div>

        {/* Password + Forget Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-base font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm font-medium text-[#003C84] hover:underline"
            >
              Forget Password?
            </button>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 relative">
            <Lock className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="e.g. ••••••••"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full text-base outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-gray-500 hover:text-[#003C84] transition"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-red-500 mt-1">Password is required</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003C84] text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-[#00539C] transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="font-medium text-[#003C84] "
          >
            Contact Admin
          </button>
        </p>
      </form>

      {/* 🔹 Forget Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Password Reset Assistance
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              For password reset requests, please contact the IT Team or email
              us at:
            </p>
            <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-[#003C84] mb-3">
              connect@gryphonacademy.co.in
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Our team will assist you with resetting your password.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForgotModal(false)}
                className="bg-[#003C84] text-white px-4 py-2 rounded-md hover:bg-[#00539C] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Contact Admin Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Contact Administrator
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              For account-related queries or access issues, please reach out at:
            </p>
            <div className="bg-gray-100 px-3 py-2 rounded-md text-sm font-medium text-[#003C84] mb-3">
              gaurav@gryphonacademy.co.in
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Our admin team will assist you further.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-[#003C84] text-white px-4 py-2 rounded-md hover:bg-[#00539C] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default AdminLogin;
