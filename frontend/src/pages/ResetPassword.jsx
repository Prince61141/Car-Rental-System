import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setMsg("Password reset successful! You can now log in.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMsg(data.message || "Failed to reset password.");
      }
    } catch {
      setMsg("Server error. Try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-[#2f1c53]">
            Reset Password
          </h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {msg && (
              <div className={success ? "text-green-600" : "text-red-600"}>
                {msg}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#2f1c53] hover:bg-[#3d3356] text-white py-2 rounded font-semibold transition"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPassword;