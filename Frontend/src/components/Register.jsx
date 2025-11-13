import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  IdCard,
  Mail,
  Phone,
  Lock,
  School,
  ChevronDown,
} from "lucide-react";
import AuthLayout from "./AuthLayout";
import ENV from "../env";
import axios from "axios";
import { toast } from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    prn: "",
    email: "",
    phoneNo: "",
    password: "",
    college: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: false });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {
      studentName: !formData.studentName,
      prn: !formData.prn,
      email: !formData.email,
      phoneNo: !formData.phoneNo,
      password: !formData.password,
      college: !formData.college,
    };
    setFormErrors(errors);

    if (Object.values(errors).every((v) => !v)) {
      try {
        setLoading(true);
        const toastId = toast.loading("Registering...");

        const response = await axios.post(
          `${ENV.BASE_URL}/auth/student/register`,
          formData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // Handle consistent response format
        if (response.data.success) {
          toast.success("Registration successful!", { id: toastId });
          navigate("/");
        } else {
          // Use message instead of error for sendResponse format
          toast.error(response.data.message || "Failed to register", {
            id: toastId,
          });
        }
      } catch (err) {
        console.error("❌ Registration error:", err);
        // Dismiss the loading toast first
        toast.dismiss();

        // Enhanced error handling for sendResponse format
        if (err.response) {
          // For sendResponse format, errors are in response.data.message
          const errorMessage =
            err.response.data?.message ||
            err.response.data?.error ||
            "Registration failed";
          toast.error(errorMessage);
        } else if (err.request) {
          toast.error("Network error - please check your connection");
        } else {
          toast.error("An error occurred during registration");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please fill all required fields");
    }
  };

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const collegeOptions = [
    {
      value: "ICEM",
      label: "ICEM",
      description: "Indira College of Engineering and Management",
    },
    {
      value: "IGSB",
      label: "IGSB",
      description: "Indira Global School of Business",
    },
  ];

  const selectedCollege = collegeOptions.find(
    (opt) => opt.value === formData.college
  );

  const handleCollegeSelect = (option) => {
    setFormData({ ...formData, college: option.value });
    setDropdownOpen(false);
    if (formErrors.college) {
      setFormErrors({ ...formErrors, college: false });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AuthLayout
      currentPage="register"
      title="Leaving Certificate Portal"
      description="Quick and easy registration for Indira College of Engineering and Management students."
      points={[
        "Register once, apply anytime",
        "College-specific selection",
        "Fast application process",
      ]}
    >
      <style>
        {`
          @keyframes scaleIn {
            from { opacity: 0; transform: scaleY(0.9); }
            to { opacity: 1; transform: scaleY(1); }
          }
          .animate-scaleIn {
            animation: scaleIn 0.2s ease;
            transform-origin: top;
          }
        `}
      </style>

      <h2 className="text-xl font-bold text-center text-[#003C84] mb-4">
        Student Registration
      </h2>

      <form
        onSubmit={handleRegister}
        className="space-y-3 w-full max-w-md mx-auto"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            Full Name
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1.5">
            <User className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              name="studentName"
              placeholder="e.g. John Doe"
              value={formData.studentName}
              onChange={handleInputChange}
              className="w-full text-sm outline-none"
            />
          </div>
          {formErrors.studentName && (
            <p className="text-xs text-rose-500 mt-1">Full name is required</p>
          )}
        </div>

        {/* PRN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            PRN
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1.5">
            <IdCard className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              name="prn"
              placeholder="e.g. 1234567890"
              value={formData.prn}
              onChange={handleInputChange}
              maxLength={10}
              className="w-full text-sm outline-none"
            />
          </div>
          {formErrors.prn && (
            <p className="text-xs text-rose-500 mt-1">PRN is required</p>
          )}
          {formData.prn.length === 10 && (
            <p className="text-xs text-emerald-500 mt-1">✓ PRN is complete</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            Email
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1.5">
            <Mail className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full text-sm outline-none"
            />
          </div>
          {formErrors.email && (
            <p className="text-xs text-rose-500 mt-1">Email is required</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            Phone Number
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1.5">
            <Phone className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="tel"
              name="phoneNo"
              placeholder="e.g. +91 9876543210"
              value={formData.phoneNo}
              onChange={handleInputChange}
              maxLength={10}
              className="w-full text-sm outline-none"
            />
          </div>
          {formErrors.phoneNo && (
            <p className="text-xs text-rose-500 mt-1">
              Phone number is required
            </p>
          )}
          {formData.phoneNo.length=== 10 && (
            <p className="text-xs text-emerald-500 mt-1">
              10 digit number complete !
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1.5">
            <Lock className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="e.g. ••••••••"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full text-sm outline-none"
            />
          </div>
          {formErrors.password && (
            <p className="text-xs text-rose-500 mt-1">Password is required</p>
          )}
        </div>

        {/* College - Custom Dropdown */}
        <div className="relative w-full" ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-0.5">
            College
          </label>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition ${
              dropdownOpen ? "border-[#003C84]" : "border-[#00539C]"
            } bg-white`}
          >
            <div className="flex items-center space-x-2">
              <School className="w-4 h-4 text-[#00539C]" />
              <span
                className={
                  selectedCollege
                    ? "text-gray-800 text-sm"
                    : "text-gray-400 text-sm"
                }
              >
                {selectedCollege ? selectedCollege.label : "Select College"}
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
              {collegeOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleCollegeSelect(option)}
                  className="group px-3 py-2 flex flex-col cursor-pointer transition rounded-md hover:bg-[#00539C] hover:text-white"
                >
                  <span className="text-sm font-medium group-hover:text-white">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 group-hover:text-white">
                    {option.description}
                  </span>
                </div>
              ))}
            </div>
          )}
          {formErrors.college && (
            <p className="text-xs text-rose-500 mt-1">
              Please select a college
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003C84] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#00539C] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
