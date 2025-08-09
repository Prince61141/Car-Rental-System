import React, { useState, useEffect } from "react";
import axios from "axios";
import carImg from "../assets/car-register.png";
import Header from "../components/Header";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "renter",
    password: "",
    confirmPassword: "",
    otp: "",
    agree: false,
  });
  const [userId, setUserId] = useState("");
  const [tempToken, setTempToken] = useState("");

  const [message, setMessage] = useState("");

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
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNextFromDetails = () => {
    // Basic validation
    if (!form.name || !form.email || !form.phone || !form.role || !form.agree) {
      setMessage("Please fill all fields and agree to the terms.");
      return;
    }
    setMessage("");
    setStep(2);
  };

  const handleResendOtp = async () => {
    if (!tempToken) {
      setMessage("Cannot resend OTP. Please restart registration.");
      return;
    }
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/users/resend-otp", {
        tempToken,
      });
      setMessage("OTP resent! Check your phone.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const handleNextFromPassword = async () => {
    if (!form.password || form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        password: form.password,
      });
      setTempToken(res.data.tempToken);
      setMessage("OTP sent! Check your phone.");
      setStep(3);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to register and send OTP."
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.otp) {
      setMessage("Please enter the OTP.");
      return;
    }
    setMessage("");
    try {
      // Step 1: Verify OTP and get userId
      const res = await axios.post(
        "http://localhost:5000/api/users/verify-otp",
        {
          tempToken,
          otp: form.otp,
        }
      );
      const userId = res.data.userId;
      setUserId(userId);
      setMessage("Registration complete!");
      setStep(4);
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed.");
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    // decoded contains: name, family_name, email, etc.
    setForm((prev) => ({
      ...prev,
      name: decoded.name || "",
      email: decoded.email || "",
      // You can split name if you want first/last name separately
    }));
    setMessage(
      "Google account info filled. Please complete the rest of the form."
    );
  };

  const handleGoogleError = () => {
    setMessage("Google Sign In was unsuccessful. Try again later.");
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Left: Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 px-8 sm:px-10 md:px-16 py-8 md:py-12 bg-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Create your account
          </h2>
          <div className="mb-8 text-gray-500"> </div>

          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextFromDetails();
              }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Your Name"
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#2F2240]"
                  value={form.name}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Your Email"
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#2F2240]"
                  value={form.email}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Phone Number</label>
                <input
                  type="number"
                  name="phone"
                  placeholder="Enter Your Phone number"
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-1 focus:ring-[#2F2240]"
                  value={form.phone}
                />
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  className="mr-2"
                  id="agree"
                />
                <label
                  htmlFor="agree"
                  className="text-sm text-selection-disabled"
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <label
                  className={`flex-1 flex items-center border rounded px-4 py-2 cursor-pointer ${
                    form.role === "renter"
                      ? "border-[#2F2240]"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="renter"
                    checked={form.role === "renter"}
                    onChange={handleChange}
                    className="mr-2 accent-[#2F2240]"
                  />
                  Renter
                </label>
                <label
                  className={`flex-1 flex items-center border rounded px-4 py-2 cursor-pointer ${
                    form.role === "peer-owner"
                      ? "border-[#2F2240]"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="peer-owner"
                    checked={form.role === "peer-owner"}
                    onChange={handleChange}
                    className="mr-2 accent-[#2F2240]"
                  />
                  Car Owner
                </label>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <button
                  type="submit"
                  className="w-full sm:w-1/2 bg-[#2F2240] text-white py-3 rounded font-semibold text-base sm:text-lg hover:bg-[#2F2240] transition"
                >
                  Sign Up
                </button>
                <div className="w-full sm:w-1/2 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                  />
                </div>
              </div>

              <div className="mt-4 text-xs sm:text-sm text-center text-gray-600">
                Already have account?{" "}
                <a href="/login" className="text-[#2F2240] font-semibold underline">
                  Login
                </a>
              </div>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNextFromPassword();
              }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium">Set Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Set Password"
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-base sm:text-lg"
                  value={form.password}
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-base sm:text-lg"
                  value={form.confirmPassword}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 rounded font-semibold text-base sm:text-lg hover:bg-purple-700 transition"
              >
                Register & Send OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
            >
              <div className="mb-6">
                <label className="block mb-1 font-medium">OTP</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  onChange={handleChange}
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400 text-base sm:text-lg"
                  value={form.otp}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white py-3 px-6 rounded font-semibold text-base sm:text-lg hover:bg-purple-700 transition"
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-purple-600 font-semibold hover:underline ml-4"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="text-green-600 text-center font-semibold text-lg sm:text-xl mt-8">
              ✅ Registration Complete!
            </div>
          )}

          {message && (
            <p className="mt-4 text-xs sm:text-sm text-center text-red-600">
              {message}
            </p>
          )}
        </div>

        {/* Right: Image & Info */}
        <div className="hidden md:flex w-1/2">
          <div className="w-full">
            <img
              src={carImg}
              alt="Car"
              className="w-full"
              style={{ height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
