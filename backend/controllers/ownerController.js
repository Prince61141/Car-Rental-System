import User from "../models/User.js";
import Document from "../models/Document.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { generateAndSendOtp, verifyOtp } from "../utils/sendOtp.js";
import cloudinary from "../utils/cloudinary.js";
import multer from "multer";
import PayoutDetails from "../models/PayoutDetails.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

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
      address: user.address,
      photo: user.photo,
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

const storage = multer.memoryStorage();
export const multerInstance = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const updateMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    let name, phone, address, aadhar, pan, photoUrl;
    if (req.is("multipart/form-data")) {
      name = req.body.name;
      phone = req.body.phone;
      address = req.body.address;
      aadhar = req.body.aadhar;
      pan = req.body.pan;
    } else {
      ({ name, phone, address, aadhar, pan } = req.body);
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (aadhar && pan) user.document = { Aadhar: aadhar, PAN: pan };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "owners/profile_photos", public_id: userId },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      user.photo = result.secure_url;
      photoUrl = result.secure_url;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated",
      user: {
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
        photo: user.photo || photoUrl || "",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPayoutDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const payout = await PayoutDetails.findOne({ owner: ownerId });
    res.json({ payout });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const savePayoutDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const data = {
      owner: ownerId,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      ifsc: req.body.ifsc,
      accountHolder: req.body.accountHolder,
    };
    const payout = await PayoutDetails.findOneAndUpdate(
      { owner: ownerId },
      data,
      { upsert: true, new: true }
    );
    res.json({ payout });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const carReport = async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId).lean();
    if (!car) return res.status(404).json({ message: "Car not found" });

    const bookings = await Booking.find({ car: carId })
      .populate({ path: "user", select: "name fullName" })
      .sort({ from: -1 })
      .lean();

    const mappedBookings = bookings.map((b) => ({
      ...b,
      from: b.pickupAt,
      to: b.dropoffAt,
      amount: b.totalAmount,
      user: b.user,
      status: b.status,
      _id: b._id,
    }));

    const carAddedDate = car.createdAt || car.addedAt || car.dateAdded || car.created_at;
    const now = new Date();
    let monthsSinceAdded = 0;
    if (carAddedDate) {
      const added = new Date(carAddedDate);
      monthsSinceAdded = (now.getFullYear() - added.getFullYear()) * 12 + (now.getMonth() - added.getMonth());
    }

    const totalBookings = mappedBookings.length;

    const totalDays = mappedBookings.reduce((sum, b) => {
      if (b.from && b.to) {
        const days =
          (new Date(b.to) - new Date(b.from)) / (1000 * 60 * 60 * 24) + 1;
        return sum + Math.max(1, Math.round(days));
      }
      return sum;
    }, 0);

    const serviceRequired =
      monthsSinceAdded >= 6 ||
      totalBookings >= 10 ||
      totalDays > 180;

    res.json({
      report: {
        car,
        totalBookings,
        totalRevenue: mappedBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
        totalDays,
        lastBookingDate: mappedBookings[0]?.from || null,
        serviceRequired,
        bookings: mappedBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOwnerNotifications = async (req, res) => {
  try {
    // Decode token manually (since you don't use protect middleware)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    // Find all cars for this owner
    const cars = await Car.find({ owner: ownerId }).select("_id");
    const carIds = cars.map((c) => c._id);

    // Find recent bookings for these cars (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({
      car: { $in: carIds },
      createdAt: { $gte: thirtyDaysAgo },
      status: { $in: ["confirmed", "completed", "cancelled"] },
    })
      .populate({ path: "car", select: "brand model" })
      .populate({ path: "user", select: "name fullName" })
      .sort({ createdAt: -1 })
      .lean();

    // Map bookings for notifications
    const notifications = bookings.map((b) => ({
      _id: b._id,
      status: b.status,
      car: b.car,
      user: b.user,
      to: b.dropoffAt || b.to || b.endDate,
      createdAt: b.createdAt,
    }));

    // Overdue reminders: not completed and end date in the past
    const overdue = bookings
      .filter(
        (b) =>
          b.status !== "Completed" &&
          (b.dropoffAt || b.to || b.endDate) &&
          new Date(b.dropoffAt || b.to || b.endDate) < now
      )
      .map((b) => ({
        _id: b._id + "_reminder",
        status: "Reminder",
        car: b.car,
        user: b.user,
        to: b.dropoffAt || b.to || b.endDate,
        createdAt: b.createdAt,
        message: `Booking for ${b.car?.brand} ${b.car?.model} with ${
          b.user?.name || b.user?.fullName || "a renter"
        } ended on ${new Date(b.dropoffAt || b.to || b.endDate).toLocaleDateString()} and is not marked as completed.`,
      }));

    // Custom sort: On the same date, Completed > Reminder > Confirmed > Cancelled > Pending/Request
    const statusOrder = {
      Completed: 1,
      Reminder: 2,
      Confirmed: 3,
      Cancelled: 4,
      Pending: 5,
      Request: 5,
    };

    const allNotifications = [...notifications, ...overdue].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateA === dateB) {
        // If same date, use status order
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
      }
      // Newest first
      return dateB - dateA;
    });

    res.json({
      notifications: allNotifications,
    });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

