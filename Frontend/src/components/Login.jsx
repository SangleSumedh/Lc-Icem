import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        const res = await fetch("http://localhost:5000/auth/student/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);

          const decoded = jwtDecode(data.token);
          localStorage.setItem("role", decoded.role);

          navigate("/student");
        } else {
          alert(data.error || "❌ Login failed");
        }
      } catch (err) {
        console.error("❌ Network error:", err);
        alert("Could not connect to backend.");
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
      {/* Heading + Subtitle */}
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
            <p className="text-sm text-red-500 mt-1">Email is required</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Password
          </label>
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
            <p className="text-sm text-red-500 mt-1">Password is required</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003C84] text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-[#00539C] transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <span className="font-medium text-[#003C84]">Contact Admin</span>
        </p>
        
      </form>
    </AuthLayout>
  );
};

export default Login;
