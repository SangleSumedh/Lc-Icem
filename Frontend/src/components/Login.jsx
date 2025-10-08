import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import AuthLayout from "./AuthLayout";
import toast from "react-hot-toast";
import ENV from "../env";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: false });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {
      email: !formData.email,
      password: !formData.password,
    };
    setFormErrors(errors);

    if (!errors.email && !errors.password) {
      try {
        setLoading(true);

        // Using axios for better error handling
        const response = await axios.post(
          `${ENV.BASE_URL}/auth/student/login`,
          formData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        // Handle sendResponse format
        if (response.data.success) {
          // Access token and user data from response.data.data
          const { token, user } = response.data.data;

          // Ensure token is a string before storing
          const tokenString = String(token).trim();
          localStorage.setItem("token", tokenString);

          // Decode token to get role
          const decoded = jwtDecode(tokenString);
          localStorage.setItem("role", decoded.role);

          // Store user data
          if (user && user.college) {
            localStorage.setItem("college", user.college);
          }
          if (user && user.prn) {
            localStorage.setItem("prn", user.prn);
          }
          if (user && user.studentName) {
            localStorage.setItem("studentName", user.studentName);
          }

          toast.success(`Welcome ${user.studentName || "Student"}`);
          navigate("/student");
        } else {
          // Use message from sendResponse format
          toast.error(response.data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);

        // Enhanced error handling for sendResponse format
        if (err.response) {
          // For sendResponse format, errors are in response.data.message
          const errorMessage = err.response.data?.message || "Login failed";
          toast.error(errorMessage);
        } else if (err.request) {
          toast.error("Network error - please check your connection");
        } else {
          toast.error("An error occurred during login");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout
      currentPage="login"
      title="Leaving Certificate Portal"
      description="Apply for Leaving Certificates at Indira College of Engineering and Management easily and quickly."
      points={[
        "Student-friendly login system",
        "Secure authentication",
        "Track application status",
      ]}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#003C84]">Student Login</h2>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back! Please enter your credentials.
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-6 w-full max-w-md mx-auto"
      >
        {/* Email */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3">
            <Mail className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="email"
              name="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full text-base outline-none"
            />
          </div>
          {formErrors.email && (
            <p className="text-sm text-rose-500 mt-1">Email is required</p>
          )}
        </div>

        {/* Password */}
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
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-sm text-rose-500 mt-1">Password is required</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00539C] text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-[#003C84] transition"
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
              gaurav@gryphonacademy.co.in
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

export default Login;
