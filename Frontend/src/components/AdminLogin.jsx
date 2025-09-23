import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/Logo.png";
import { jwtDecode } from "jwt-decode";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("department"); // ✅ default = department

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: false });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {
      username: !formData.username,
      password: !formData.password,
    };
    setFormErrors(errors);

    if (!errors.username && !errors.password) {
      try {
        setLoading(true);

        // ✅ Choose API based on login type
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
            navigate("/admin-dashboard");
          } else if (decoded.role === "department") {
            localStorage.setItem("deptName", decoded.deptName.toLowerCase());
            navigate(
              `/admin-dashboard/${decoded.deptName
                .toLowerCase()
                .replace(/\s+/g, "-")}`
            );
          }
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
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Header */}
      <header className="bg-[#00539C] text-white shadow-lg">
        <div className="flex justify-between items-center py-4 px-6">
          <img src={Logo} alt="Logo" className="h-16" />
          <div className="flex space-x-4">
            <button onClick={() => navigate("/")} className="px-4 py-2">
              Student Login
            </button>
            <button onClick={() => navigate("/admin-login")} className="px-4 py-2">
              Admin Login
            </button>
            <button onClick={() => navigate("/register")} className="px-4 py-2">
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex items-center justify-center bg-gray-100">
          <img src="image.png" alt="Admin" className="w-full object-contain h-auto" />
        </div>

        <div className="w-1/2 bg-[#003C84] p-5 flex items-start justify-center">
          <div className="max-w-md w-full text-white">
            <h1 className="text-2xl font-bold mb-2">ICEM CRM - Admin Login</h1>

            {/* Login Type Selector */}
            <div className="mb-4">
              <label className="block mb-2 text-sm">Login As</label>
              <select
                value={loginType}
                onChange={(e) => setLoginType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-black"
              >
                <option value="department">Department</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-white/90 text-sm font-medium mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl text-black ${
                    formErrors.username ? "border-red-500" : ""
                  }`}
                  placeholder="Enter username"
                />
                {formErrors.username && (
                  <p className="text-xs text-red-300">Username is required</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-white/90 text-sm font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl text-black ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 text-black"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-red-300">Password is required</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#003C84] font-semibold py-3 px-6 rounded-xl"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
