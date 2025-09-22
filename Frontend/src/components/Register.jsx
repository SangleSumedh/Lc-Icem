import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/Logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: "",
    prn: "",
    email: "",
    phoneNo: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    const errors = {
      studentName: !formData.studentName,
      prn: !formData.prn,
      email: !formData.email,
      phoneNo: !formData.phoneNo,
      password: !formData.password,
    };

    setFormErrors(errors);

    if (Object.values(errors).every((v) => !v) && agreeToTerms) {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/auth/student/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Registration successful!");
          navigate("/"); // redirect to login page
        } else {
          alert(data.error || "❌ Failed to register");
        }
      } catch (err) {
        console.error("❌ Network error:", err);
        alert("Could not connect to backend. Check server.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Navbar */}
      <header className="bg-[#00539C] text-white shadow-lg">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={Logo} alt="Logo" className="h-16" />
            </div>
            <div className="flex space-x-4">
              <button onClick={() => navigate("/")} className="px-4 py-2">Student Login</button>
              <button onClick={() => navigate("/admin-login")} className="px-4 py-2">Admin Login</button>
              <button onClick={() => navigate("/register")} className="px-4 py-2 bg-white text-[#00539C]">Register</button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex items-center justify-center bg-gray-100">
          <img src="image.png" alt="Students" className="w-full object-contain h-auto" />
        </div>

        <div className="w-1/2 bg-[#003C84] p-5 flex items-start justify-center overflow-y-auto">
          <div className="max-w-md w-full text-white py-4">
            <h1 className="text-2xl font-bold text-center mb-4">ICEM CRM</h1>
            <form onSubmit={handleRegister} className="space-y-3">
              <input type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg text-black" />
              <input type="text" name="prn" value={formData.prn} onChange={handleInputChange} placeholder="PRN" className="w-full px-3 py-2 border rounded-lg text-black" />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full px-3 py-2 border rounded-lg text-black" />
              <input type="tel" name="phoneNo" value={formData.phoneNo} onChange={handleInputChange} placeholder="Phone Number" className="w-full px-3 py-2 border rounded-lg text-black" />
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full px-3 py-2 border rounded-lg text-black" />

              <div className="flex items-start">
                <input type="checkbox" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} className="h-4 w-4 mt-1" />
                <label className="ml-2 text-xs">I agree to the Terms and Privacy Policy</label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-white text-[#003C84] py-2 px-4 rounded-lg">
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-xs">
              <button onClick={() => navigate("/")} className="underline">Already have an account? Login</button>
              <button onClick={() => navigate("/admin-login")} className="underline">Admin Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
