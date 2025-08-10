import Car from "../models/Car.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";
import {
  buildCarCreatedEmail,
  buildCarDeletedEmail,
} from "../utils/mailTemplates.js";

const storage = multer.memoryStorage();
export const multerInstance = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

const fetchImageBuffer = async (url) => {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return null;
  }
};

const toPreviewImageUrl = (url) => {
  if (!url) return null;
  if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) return url;
  const isCloudinaryPdf =
    /\.pdf(\?.*)?$/i.test(url) &&
    url.includes("res.cloudinary.com") &&
    url.includes("/image/upload/");
  if (isCloudinaryPdf) {
    return url.replace(
      "/image/upload/",
      "/image/upload/pg_1,f_png,w_1600,c_fit/"
    );
  }
  return null;
};

const generateCarDetailsPdfBuffer = async (car, { logoUrl } = {}) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) =>
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  );

  // Header logo top-right
  if (logoUrl) {
    const buf = await fetchImageBuffer(logoUrl);
    if (buf) {
      const w = 56;
      doc.image(buf, doc.page.width - doc.page.margins.right - w, 18, {
        width: w,
      });
    }
  }

  // Title
  doc.fontSize(18).text("Car Details", { align: "center" }).moveDown(0.8);

  const addRow = (label, val) => {
    doc.fontSize(12).fillColor("#333").text(`${label}: `, { continued: true });
    doc.fillColor("#111").text(val ?? "-");
  };

  addRow("Brand", car.brand);
  addRow("Model", car.model);
  addRow("Year", car.year);
  addRow("Car Number", car.carnumber);
  addRow("Fuel Type", car.fuelType);
  addRow("Transmission", car.transmission);
  addRow("Seats", car.seats);
  addRow(
    "Price Per Day",
    car.pricePerDay != null ? `Rs. ${car.pricePerDay}` : "-"
  );
  if (car.description) addRow("Description", car.description);

  if (car.location) {
    const loc = [
      car.location?.addressLine,
      car.location?.area,
      car.location?.city,
      car.location?.state,
      car.location?.country,
      car.location?.pincode,
    ]
      .filter(Boolean)
      .join(", ");
    addRow("Location", loc);
  }

  // Car photo
  const firstImage = Array.isArray(car.image)
    ? car.image[0]
    : Array.isArray(car.images)
      ? car.images[0]
      : car.image;
  if (firstImage) {
    const img = await fetchImageBuffer(firstImage);
    if (img) {
      const maxW =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;
      doc.moveDown(0.6);
      doc.fontSize(14).text("Car Photo", { align: "left" }).moveDown(0.2);
      doc.image(img, { fit: [maxW, 280], align: "center" });
    }
  }

  // Documents (render Cloudinary PDF previews as PNG)
  const docs = car.documents || {};
  const entries = [
    ["RC", docs.rc],
    ["Insurance", docs.insurance],
    ["Pollution", docs.pollution],
  ].filter(([, url]) => !!url);

  if (entries.length) {
    doc.addPage();
    if (logoUrl) {
      const buf = await fetchImageBuffer(logoUrl);
      if (buf) {
        const w = 56;
        doc.image(buf, doc.page.width - doc.page.margins.right - w, 18, {
          width: w,
        });
      }
    }
    doc.fontSize(16).text("Documents", { align: "center" }).moveDown(0.8);

    for (const [label, url] of entries) {
      const previewUrl = toPreviewImageUrl(url) || url; // if already an image
      doc.fontSize(13).text(label, { align: "center" }).moveDown(0.3);

      const imgBuf = await fetchImageBuffer(previewUrl);
      if (imgBuf) {
        const maxW =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;
        doc.image(imgBuf, { fit: [maxW, 560], align: "center" }).moveDown(0.6);
      } else {
        doc
          .fontSize(10)
          .fillColor("#666")
          .text("(Preview not available)", { align: "center" })
          .moveDown(0.6);
      }
    }
  }

  // Signature bottom-right
  const sigUrl = docs.signature || car.signature;
  if (sigUrl) {
    const sig = await fetchImageBuffer(sigUrl);
    if (sig) {
      const y = doc.page.height - doc.page.margins.bottom - 80;
      const w = 150;
      doc.image(sig, doc.page.width - doc.page.margins.right - w, y, {
        width: w,
      });
      doc
        .fontSize(10)
        .fillColor("#111")
        .text(
          "Owner Signature",
          doc.page.width - doc.page.margins.right - 110,
          y + 62
        );
    }
  }

  doc.end();
  return done;
};

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

    const parsedLocation =
      typeof location === "string" ? JSON.parse(location) : location;

    if (
      !title ||
      !brand ||
      !model ||
      !year ||
      !pricePerDay ||
      !description ||
      !parsedLocation?.city
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Upload images (await properly)
    const imageUrls = [];
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "cars/images",
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Upload documents
    const documentUrls = {};
    const docFields = ["rc", "insurance", "pollution", "signature"];
    for (const field of docFields) {
      const file = req.files?.[field]?.[0];
      if (file) {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder: "cars/documents",
          public_id: `${carnumber}_${field}`,
        });
        documentUrls[field] = result.secure_url;
      }
    }

    if (
      !documentUrls.rc ||
      !documentUrls.insurance ||
      !documentUrls.pollution ||
      !documentUrls.signature
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All documents must be uploaded" });
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

    // Fire-and-forget email with attached PDF
    (async () => {
      try {
        const user = await User.findById(ownerId).select("email name");
        if (!user?.email) return;

        const appName = process.env.APP_NAME || "Car Rental";
        const logoUrl = process.env.APP_LOGO_URL || ""; // optional for PDF header
        const firstImage = Array.isArray(car.image)
          ? car.image[0]
          : Array.isArray(car.images)
            ? car.images[0]
            : car.image || null;

        const pdfBuffer = await generateCarDetailsPdfBuffer(car, { logoUrl });

        await sendEmail({
          to: user.email,
          subject: `${appName}: Car listed - ${car.brand || ""} ${car.model || ""
            } ${car.carnumber ? `(${car.carnumber})` : ""}`.trim(),
          text: "Your car has been added to the platform.",
          html: buildCarCreatedEmail({
            appName,
            userName: user.name || "Owner",
            car,
            firstImage,
          }),
          attachments: [
            {
              filename: `${car.brand || "Car"}_${car.model || ""}_details.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (e) {
        console.error("addMyCar email error:", e?.message || e);
      }
    })();

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
};

export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car)
      return res.status(404).json({ success: false, message: "Car not found" });
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
    if (!car)
      return res.status(404).json({ success: false, message: "Car not found" });

    // Update allowed fields
    const fields = [
      "brand",
      "model",
      "carnumber",
      "year",
      "pricePerDay",
      "fuelType",
      "transmission",
      "seats",
      "description",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) car[field] = req.body[field];
    });

    // Update location if provided
    if (req.body.location) {
      const loc =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
      car.location = {
        ...car.location,
        ...loc,
      };
    }

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
    if (!car)
      return res.status(404).json({ success: false, message: "Car not found" });

    car.availability = available;
    await car.save();

    res.json({ success: true, car });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update availability" });
  }
};

export const searchCars = async (req, res) => {
  try {
    const { pickup, dropoff, pickupDate, dropoffDate } = req.query;

    const query = {};
    if (pickup) query["location.city"] = pickup;

    const cars = await Car.find(query);

    const mappedCars = cars.map((car) => ({
      _id: car._id,
      image: Array.isArray(car.image)
        ? car.image[0]
        : car.images?.[0] || car.image || "",
      name: car.title || car.model || "",
      rating: car.rating || 4.7,
      price: car.pricePerDay || car.price || 0,
      tags: [car.transmission, car.fuelType, car.category].filter(Boolean),
      ...car._doc,
    }));

    res.json({ success: true, cars: mappedCars });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const extractPublicId = (url = "") => {
  try {
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;
    const noQuery = afterUpload.split("?")[0];
    const noVersion = noQuery.replace(/v\d+\//, "");
    const noExt = noVersion.replace(/\.[^/.]+$/, "");
    return noExt;
  } catch {
    return null;
  }
};

const destroyCloudinaryByUrl = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    } catch {
    }
  }
};

export const deleteCar = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const carId = req.params.id;
    const car = await Car.findOne({ _id: carId, owner: ownerId });
    if (!car)
      return res.status(404).json({ success: false, message: "Car not found" });

    const user = await User.findById(ownerId).select("email name");
    const toEmail = user?.email || decoded.email; // fallback if token carries email
    const ownerName = user?.name || "Owner";
    const firstImage = Array.isArray(car.image)
      ? car.image[0]
      : Array.isArray(car.images)
        ? car.images[0]
        : car.image || null;
    const appName = process.env.APP_NAME || "Car Rental";

    const imageUrls = Array.isArray(car.image)
      ? car.image
      : Array.isArray(car.images)
        ? car.images
        : car.image
          ? [car.image]
          : [];
    const docUrls = Object.values(car.documents || {});

    await Promise.all([
      ...imageUrls.map((u) => destroyCloudinaryByUrl(u)),
      ...docUrls.map((u) => destroyCloudinaryByUrl(u)),
    ]);

    await Car.deleteOne({ _id: car._id });

    if (toEmail) {
      const subject = `${appName}: Car deleted - ${car.brand || ""} ${car.model || ""
        } ${car.carnumber ? `(${car.carnumber})` : ""}`.trim();
      const html = buildCarDeletedEmail({
        appName,
        userName: ownerName,
        car,
        firstImage,
      });
      sendEmail({
        to: toEmail,
        subject,
        text: "Your car listing has been deleted.",
        html,
      }).catch((e) => console.error("deleteCar email error:", e?.message || e));
    }

    return res.json({ success: true, message: "Car deleted successfully" });
  } catch (err) {
    console.error("Delete Car Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete car" });
  }
};