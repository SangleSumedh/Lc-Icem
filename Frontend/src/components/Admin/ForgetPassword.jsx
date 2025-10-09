import React, { useState } from "react";
import ENV from "../../env";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔹 Call backend API here (POST /forget-password)
    fetch("http://localhost:5000/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessage("✅ Reset link sent to your email!");
        } else {
          setMessage("❌ Failed to send reset link. Try again.");
        }
      })
      .catch(() => setMessage("⚠️ Something went wrong!"));
  };

  return (
    <div className="flex justify-center items-center h-[80vh] bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#00539C]">
          Forget Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter your registered Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2  rounded-md focus:ring-1 border border-gray-300 focus:ring-gray-400 focus:border-gray-400 focus:outline-none focus:shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00539C] text-white py-2 rounded-md hover:bg-[#004080] transition"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ForgetPassword;
