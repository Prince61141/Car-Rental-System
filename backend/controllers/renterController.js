import User from "../models/User.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";

// Multer setup for file uploads
const storage = multer.memoryStorage();
export const multerInstance = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Indian Renter Verification
export const verifyIndianRenter = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ verified: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { aadhar, pan, licenceNumber } = req.body;
    if (!aadhar || !pan || !licenceNumber || !req.files?.licencePhoto) {
      return res.status(400).json({ verified: false, message: "All fields are required" });
    }

    // Upload licence photo to cloudinary
    const licencePhotoResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "renters/licence_photos", public_id: userId + "_licence" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.files.licencePhoto[0].buffer);
    });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ verified: false, message: "User not found" });

    user.Citizenship = "Indian";
    user.document = {
      Aadhar: aadhar,
      PAN: pan,
      Driving_License: licenceNumber,
      Passport: "",
      Passport_URL: "",
      Driving_License_URL: licencePhotoResult.secure_url,
    };
    user.verified = true;
    await user.save();

    res.json({ verified: true, message: "Indian renter verified successfully" });
  } catch (err) {
    res.status(500).json({ verified: false, message: "Server error" });
  }
};

// Foreigner Renter Verification
export const verifyForeignerRenter = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ verified: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { passport, licenceNumber } = req.body;
    if (!passport || !licenceNumber || !req.files?.photo || !req.files?.licencePhoto) {
      return res.status(400).json({ verified: false, message: "All fields are required" });
    }

    // Upload passport/identity photo
    const photoResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "renters/identity_photos", public_id: userId + "_identity" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.files.photo[0].buffer);
    });

    // Upload licence photo
    const licencePhotoResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "renters/licence_photos", public_id: userId + "_licence" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.files.licencePhoto[0].buffer);
    });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ verified: false, message: "User not found" });

    user.Citizenship = "Foreigner";
    user.document = {
      Aadhar: "",
      PAN: "",
      Driving_License: licenceNumber,
      Passport: passport,
      Passport_URL: photoResult.secure_url,
      Driving_License_URL: licencePhotoResult.secure_url,
    };
    user.verified = true;
    await user.save();

    res.json({ verified: true, message: "Foreigner renter verified successfully" });
  } catch (err) {
    res.status(500).json({ verified: false, message: "Server error" });
  }
};