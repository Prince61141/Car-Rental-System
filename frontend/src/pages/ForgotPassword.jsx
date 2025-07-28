import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
        setMsg("Password reset link sent to your email.");
      } else {
        setMsg(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setMsg("Server error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Header />
    
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-[#2f1c53]">Forgot Password</h2>
        {sent ? (
          <div className="text-green-600 mb-4">{msg}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {msg && <div className="text-red-600">{msg}</div>}
            <button
              type="submit"
              className="w-full bg-[#2f1c53] hover:bg-[#3d3356] text-white py-2 rounded font-semibold transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          <a href="/login" className="text-purple-700 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}

export default ForgotPassword;