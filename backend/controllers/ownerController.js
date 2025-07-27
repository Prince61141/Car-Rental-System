import User from "../models/User.js";
import Document from "../models/Document.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { generateAndSendOtp, verifyOtp } from "../utils/sendOtp.js";

export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      document: user.document,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const lookupDocument = async (req, res) => {
  const { aadhar, pan } = req.body;

  if (!aadhar || !pan) {
    return res
      .status(400)
      .json({ success: false, message: "Missing Aadhar or PAN" });
  }

  try {
    const doc = await Document.findOne({ aadhar, pan });
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, message: "No match found" });
    }

    return res.json({ success: true, name: doc.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyOwner = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ verified: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const email = decoded.email;

    if (!userId) {
      return res
        .status(400)
        .json({ verified: false, message: "Invalid token" });
    }

    const { aadhar, pan } = req.body;
    if (!aadhar || !pan) {
      return res
        .status(400)
        .json({ verified: false, message: "Aadhar and PAN are required" });
    }

    const documentRecord = await Document.findOne({ aadhar, pan });
    if (!documentRecord) {
      return res.status(404).json({
        verified: false,
        message: "Aadhar and PAN do not match any record",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ verified: false, message: "User not found" });
    }

    user.verified = true;
    user.role = "peer-owner";
    user.document = { Aadhar: aadhar, PAN: pan };
    user.updatedAt = Date.now();

    await user.save();

    try {
      await sendEmail({
        to: email,
        subject: "Verification Successful",
        text: `Hi ${user.name},\n\nYour account has been successfully verified using Aadhar and PAN. Now You Can List Your Car.\n\nWelcome aboard as a Owner!\n\nRegards,\nAutoConnect Team`,
      });
    } catch (mailErr) {
      console.error("Failed to send welcome email:", mailErr);
    }

    return res.json({
      verified: true,
      message: "Aadhar and PAN verified, user updated and email sent",
    });
  } catch (err) {
    console.error("Verify Owner Error:", err);
    return res.status(500).json({ verified: false, message: "Server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { name, phone, address, aadhar, pan } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (aadhar && pan) user.document = { Aadhar: aadhar, PAN: pan };

    await user.save();

    res.json({ success: true, message: "Profile updated", user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      aadhar,
      pan,
      role: user.role,
      verified: user.verified,
      document: user.document,
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
