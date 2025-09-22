import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/Logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: false });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = { email: !formData.email, password: !formData.password };
    setFormErrors(errors);

    if (!errors.email && !errors.password && agreeToTerms) {
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
          localStorage.setItem("role", "student");
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
    <div className="h-screen w-full flex flex-col bg-white">
      <header className="bg-[#00539C] text-white shadow-lg">
        <div className="flex justify-between items-center py-4 px-6">
          <img src={Logo} alt="Logo" className="h-16" />
          <div className="flex space-x-4">
            <button onClick={() => navigate("/")} className="px-4 py-2">Student Login</button>
            <button onClick={() => navigate("/admin-login")} className="px-4 py-2">Admin Login</button>
            <button onClick={() => navigate("/register")} className="px-4 py-2">Register</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex items-center justify-center bg-gray-100">
          <img src="image.png" alt="Students" className="w-full object-contain h-auto" />
        </div>
        <div className="w-1/2 bg-[#003C84] p-5 flex items-start justify-center">
          <div className="max-w-md w-full text-white">
            <h1 className="text-2xl font-bold mb-2">ICEM CRM - Student Login</h1>
            <form onSubmit={handleLogin} className="space-y-5">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-black" />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-black" />

              <div className="flex items-start">
                <input type="checkbox" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} className="h-4 w-4 mt-1" />
                <label className="ml-2 text-xs">I agree to Terms</label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-white text-[#003C84] py-2 px-4 rounded-lg">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-xs">
              <button onClick={() => navigate("/forget-password")} className="underline">Forget Password?</button>
              <button onClick={() => navigate("/register")} className="underline">Register</button>
              <button onClick={() => navigate("/admin-login")} className="underline">Admin Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
