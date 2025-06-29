import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    otp: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    let phone = form.phone;
    if (!phone.startsWith("+")) {
      phone = "+91" + phone;
    }
    try {
      await axios.post("http://localhost:5000/api/users/request-otp", {
        phone: form.phone,
      });
      setMessage("OTP sent! Check your phone.");
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to send OTP.");
    }
  };

  const registerUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register",
        form
      );
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setMessage(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {step === 1 && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone (with country code)"
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            />
            <select
              name="role"
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded"
            >
              <option value="renter">Renter</option>
              <option value="peer-owner">Peer-to-Peer Owner</option>
              <option value="fleet">Fleet Owner(Company)</option>
            </select>
            <button
              onClick={sendOtp}
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
              name="otp"
              placeholder="Enter OTP"
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              onClick={registerUser}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Verify & Register
            </button>
          </>
        )}

        {step === 3 && (
          <div className="text-green-600 text-center font-semibold">
            ✅ Registration Complete!
          </div>
        )}

        {message && (
          <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
