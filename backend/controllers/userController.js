
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { generateAndSendOtp, verifyOtp } from "../utils/sendOtp.js";

export const registerWithPhone = async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const tempToken = jwt.sign({ name, email, phone,password, role }, "tempSecret", { expiresIn: "10m" });

    await generateAndSendOtp(phone);
    res.json({ success: true, tempToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP send failed" });
  }
};

// Step 2: Verify OTP, then save user
export const verifyPhoneOtp = async (req, res) => {
  const { tempToken, otp } = req.body;
  try {
    const decoded = jwt.verify(tempToken, "tempSecret");
    const { name, email, phone,password, role } = decoded;

    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const valid = verifyOtp(phone, otp);
    if (!valid) return res.status(400).json({ message: "Invalid OTP" });

    const user = new User({ name, email, phone,password, role, verified: true });
    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to AutoConnect!",
        text: `Hello ${name},\n\nYour registration was successful. Welcome to AutoConnect!`,
        html: `<p>Hello <b>${name}</b>,</p><p>Your registration was successful. Welcome to AutoConnect!</p>`
      });
    } catch (mailErr) {
      console.error("Failed to send welcome email:", mailErr);
    }

    res.json({ success: true, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

export const resendOtp = async (req, res) => {
  const { tempToken } = req.body;
  try {
    const decoded = jwt.verify(tempToken, "tempSecret");
    const { phone } = decoded;

    // Resend OTP
    await generateAndSendOtp(phone);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.password !== password)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretKey",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};