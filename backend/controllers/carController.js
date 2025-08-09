import Car from "../models/Car.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";

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

    // ⬇️ Upload images to Cloudinary
    const imageUrls = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const uploadRes = await cloudinary.uploader.upload_stream({ folder: "cars/images" }, (err, result) => {
          if (err) throw err;
          imageUrls.push(result.secure_url);
        });
        uploadRes.end(file.buffer);
      }
    }

    // ⬇️ Upload documents
    const documentUrls = {};
    const docFields = ["rc", "insurance", "pollution"];

    for (const field of docFields) {
      const file = req.files?.[field]?.[0];
      if (file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cars/documents", public_id: `${carnumber}_${field}` },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        documentUrls[field] = result.secure_url;
      }
    }

    // Ensure all docs uploaded
    if (!documentUrls.rc || !documentUrls.insurance || !documentUrls.pollution) {
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
        area: parsedLocation.area,
        country: parsedLocation.country || "India",
        addressLine: parsedLocation.addressLine || "",
        pincode: parsedLocation.pincode || "",
        digipin: parsedLocation.digipin || "",
      },
      availability,
      image: imageUrls,
      documents: documentUrls,
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

export const getallCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found" });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCar = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const carId = req.params.id;
    const car = await Car.findOne({ _id: carId, owner: ownerId });
    if (!car) return res.status(404).json({ success: false, message: "Car not found" });

    // Update allowed fields
    const fields = [
      "brand", "model", "carnumber", "year", "pricePerDay",
      "fuelType", "transmission", "seats", "description"
    ];
    fields.forEach(field => {
      if (req.body[field] !== undefined) car[field] = req.body[field];
    });

    // Update location if provided
    if (req.body.location) {
      const loc = typeof req.body.location === "string"
        ? JSON.parse(req.body.location)
        : req.body.location;
      car.location = {
        ...car.location,
        ...loc,
      };
    }

    // Optionally: handle image/documents update here if you want

    await car.save();
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update car" });
  }
};

export const updateCarAvailability = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const carId = req.params.id;
    const { available } = req.body;

    // Only the owner can update their car
    const car = await Car.findOne({ _id: carId, owner: ownerId });
    if (!car) return res.status(404).json({ success: false, message: "Car not found" });

    car.availability = available;
    await car.save();

    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update availability" });
  }
};