import Car from "../models/Car.js";
import jwt from "jsonwebtoken";
import multer from "multer";

const storage = multer.memoryStorage();
export const multerInstance = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const addMyCar = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const {
      title,
      brand,
      model,
      carnumber,
      year,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      location,
      availability = true,
      description,
    } = req.body;

    const parsedLocation = typeof location === "string" ? JSON.parse(location) : location;

    if (!title || !brand || !model || !year || !pricePerDay || !description || !parsedLocation?.city) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const images = (req.files?.images || []).map(file => file.buffer.toString("base64"));

    const documents = {
      rc: req.files?.rc?.[0]?.buffer.toString("base64") || null,
      insurance: req.files?.insurance?.[0]?.buffer.toString("base64") || null,
      pollution: req.files?.pollution?.[0]?.buffer.toString("base64") || null,
    };

    if (!documents.rc || !documents.insurance || !documents.pollution) {
      return res.status(400).json({ success: false, message: "All documents must be uploaded" });
    }

    const car = new Car({
      title,
      brand,
      model,
      carnumber,
      year,
      pricePerDay,
      fuelType,
      transmission,
      seats,
      location: {
        city: parsedLocation.city,
        state: parsedLocation.state,
        country: parsedLocation.country || "India",
        addressLine: parsedLocation.addressLine || "",
        pincode: parsedLocation.pincode || "",
      },
      availability,
      image: images,
      documents,
      description,
      owner: ownerId,
    });

    await car.save();
    res.status(201).json({ success: true, car });
  } catch (err) {
    console.error("Add Car Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyCars = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const cars = await Car.find({ owner: ownerId });
    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};