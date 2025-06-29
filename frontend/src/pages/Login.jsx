import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const requestOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/request-otp", {
        phone: phone.startsWith("+") ? phone : "+91" + phone,
      });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", {
        phone: phone.startsWith("+") ? phone : "+91" + phone,
        otp,
      });

      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      alert(`Welcome ${user.name} (${user.role})`);

      // Redirect based on role
      switch (user.role) {
        case "admin":
          window.location.href = "/admin";
          break;
        case "fleet":
          window.location.href = "/fleet";
          break;
        case "owner":
          window.location.href = "/owner";
          break;
        default:
          window.location.href = "/renter";
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid OTP");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">OTP Login</h2>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full p-2 border rounded mb-4"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={requestOtp}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-2 border rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Verify & Login
            </button>
          </>
        )}

        {message && <p className="mt-4 text-sm text-center text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default Login;