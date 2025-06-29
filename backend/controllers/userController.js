import User from "../models/User.js";
import { generateAndSendOtp } from "../utils/otpHandler.js";
import { sendOtp } from "../utils/sendOtp.js";
import sendEmail from "../utils/sendEmail.js";
const otpMap = new Map(); // for both registration & login
const formatPhone = (phone) => (!phone.startsWith("+") ? "+91" + phone : phone);

// Request OTP
export const requestOtp = async (req, res) => {
  const phone = formatPhone(req.body.phone);
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  try {
    await generateAndSendOtp(phone, otpMap);
    res.json({ success: true, message: "OTP sent to phone" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Register with OTP
export const registerUser = async (req, res) => {
  const { name, email, password, phone, role, otp } = req.body;
  const fullPhone = formatPhone(phone);

  if (otpMap.get(fullPhone) !== otp) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const newUser = new User({
      name,
      email,
      phone: fullPhone,
      role: role || "renter",
    });

    await newUser.save();
    otpMap.delete(fullPhone);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
    await sendEmail(
      newUser.email,
      "Welcome to Car Rental!",
      `Hello ${newUser.name},\n\nThanks for registering on Car Rental System.\n\nYou can now log in and start booking or listing cars.\n\n🚗 Happy Renting!`
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login with OTP
export const loginUser = async (req, res) => {
  const { phone, otp } = req.body;
  const fullPhone = formatPhone(phone);

  if (otpMap.get(fullPhone) !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const user = await User.findOne({ phone: fullPhone });
  if (!user) return res.status(404).json({ error: "User not found" });

  otpMap.delete(fullPhone);

  res.json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};
