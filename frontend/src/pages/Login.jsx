import React, { useState, useEffect } from "react";
import carImg from "../assets/car-register.png";
import Header from "../components/Header";
import { jwtDecode } from "jwt-decode";
import "../assets/loading.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (decoded.role === "renter") {
          window.location.href = "/renter/dashboard";
        } else if (decoded.role === "peer-owner") {
          window.location.href = "/peer-owner/dashboard";
        } else {
          window.location.href = "/";
        }
      } catch {
        localStorage.removeItem("token");
        setAuthChecking(false);
      }
    } else {
      setAuthChecking(false);
    }
  }, []);

  if (authChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="three-body flex gap-2">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email,
          password,
          remember,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        if (data.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (data.user.role === "renter") {
          window.location.href = "/renter/dashboard";
        } else if (data.user.role === "peer-owner") {
          window.location.href = "/peer-owner/dashboard";
        } else {
          window.location.href = "/";
        }
      } else {
        setMessage(data.message || "Invalid email or password");
      }
    } catch (err) {
      setLoading(false);
      setMessage("Server error. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login coming soon!");
  };

  return (
    <div>
      <Header scrollEffect={false} />
      <div className="flex md:flex-row bg-white">
        {/* Left: Login Form */}
        <div className="flex flex-col justify-center px-8 w-full md:w-1/2 min-h-screen">
          <div className="max-w-md w-full mx-auto text-selection-disabled">
            <h1 className="text-5xl font-extrabold text-[#3d3356] mb-2 leading-tight">
              Hello,
              <br />
              welcome back
            </h1>
            <p className="text-[#3d3356] text-opacity-60 mb-8">
              hey, welcome back to you favourite rental platform
            </p>
            <form onSubmit={handleLogin} className="space-y-5">
              <input
                type="text"
                placeholder="Enter Your Email"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center text-[#3d3356] text-opacity-80 text-sm text-selection-disabled">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="mr-2"
                  />
                  Remember me
                </label>
                <a
                  className="text-[#3d3356] text-opacity-80 hover:underline text-sm"
                  href="/forgot-password"
                >
                  forgot password?
                </a>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#3d3356] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#2a223e] transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex-1 border border-[#3d3356] text-[#3d3356] py-3 rounded-lg font-semibold text-lg hover:bg-[#f6f4fa] transition"
                >
                  continue with google
                </button>
                
              </div>
              {message && (
                <div className="text-red-600 text-sm text-center mt-2">
                  {message}
                </div>
              )}
            </form>
            <div className="mt-5 text-[#3d3356]  center text-opacity-80 text-sm">
              Don't have account?{" "}
              <a href="/register" className="font-semibold hover:underline">
                Sign up
              </a>
            </div>
          </div>
        </div>
        {/* Right: Car and Person Image */}
        <div className="hidden md:flex w-1/2 relative bg-transparent">
          <img src={carImg} alt="Car and person" className="drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
};

export default Login;