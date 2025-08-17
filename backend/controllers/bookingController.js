import fs from "fs";
import path from "path";
import Booking from "../models/Booking.js";
import Car from "../models/car.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import multer from "multer";

const HOUR_MS = 60 * 60 * 1000;
const MIN_LEAD_HOURS = 3;
const MIN_DURATION_HOURS = 4;

const toDate = (v) => {
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d;
};

const hoursBetween = (start, end) => {
  const ms = end.getTime() - start.getTime();
  return ms / HOUR_MS;
};

const hasOverlap = async (carId, start, end) => {
  return await Booking.exists({
    car: carId,
    status: { $in: ["pending", "confirmed"] },
    pickupAt: { $lt: end },
    dropoffAt: { $gt: start },
  });
};

const calcWeekendRemainderPricing = (start, end, pricePerDay) => {
  const dayPrice = Number(pricePerDay);
  const basePerHour = dayPrice / 24;
  const weekendMultiplier = 1.1; // 10% extra on weekend hours (Sat/Sun)

  const totalHoursRaw = (end.getTime() - start.getTime()) / HOUR_MS;
  const fullDays = Math.floor(totalHoursRaw / 24);

  const remainderRaw = totalHoursRaw - fullDays * 24;
  const remainderHours = Math.ceil(Math.max(0, remainderRaw - 1e-9));

  let total = fullDays * dayPrice;
  let weekendHours = 0;
  let weekdayHours = 0;

  if (remainderHours > 0) {
    const remainderStart = new Date(start.getTime() + fullDays * 24 * HOUR_MS);
    for (let i = 0; i < remainderHours; i++) {
      const slotStart = new Date(remainderStart.getTime() + i * HOUR_MS);
      const day = slotStart.getDay(); // 0=Sun, 6=Sat
      const isWeekend = day === 0 || day === 6;
      const rate = basePerHour * (isWeekend ? weekendMultiplier : 1);
      total += rate;
      if (isWeekend) weekendHours++; else weekdayHours++;
    }
  }

  return {
    mode: "daily-plus-weekend-hourly",
    fullDays,
    remainderHours,
    pricePerHourWeekday: Number(basePerHour.toFixed(2)),
    pricePerHourWeekend: Number((basePerHour * weekendMultiplier).toFixed(2)),
    totalAmount: Math.round(total),
    billableDays: fullDays, // days charged at day price
    breakdown: { weekdayHours, weekendHours },
  };
};

export const getAllCities = async (req, res) => {
  try {
    const cities = await Car.distinct("location.city");
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch cities", error: err.message });
  }
};

export const quote = async (req, res) => {
  try {
    const { carId, pickupAt, dropoffAt } = req.body || {};
    const start = toDate(pickupAt);
    const end = toDate(dropoffAt);
    if (!carId || !start || !end || end <= start) {
      return res.status(200).json({
        success: true,
        available: false,
        code: "INVALID_INPUT",
        message: "Invalid pickup/dropoff.",
      });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(200).json({
        success: true,
        available: false,
        code: "CAR_NOT_FOUND",
        message: "Car not found.",
      });
    }
    if (car.availability === false) {
      return res.status(200).json({
        success: true,
        available: false,
        code: "CAR_UNAVAILABLE",
        message: "Car is currently unavailable.",
      });
    }

    const now = new Date();
    const violations = [];
    if (start.getTime() < now.getTime() + MIN_LEAD_HOURS * HOUR_MS) {
      violations.push({
        code: "PICKUP_TOO_SOON",
        message: `Pickup must be at least ${MIN_LEAD_HOURS} hours from now.`,
      });
    }
    const totalHours = hoursBetween(start, end);
    if (totalHours < MIN_DURATION_HOURS) {
      violations.push({
        code: "DURATION_TOO_SHORT",
        message: `Minimum rental duration is ${MIN_DURATION_HOURS} hours.`,
      });
    }

    const overlap = await hasOverlap(car._id, start, end);
    const pricePerDay = Number(car.pricePerDay || 0);

    let response;
    if (totalHours <= 24) {
      response = {
        mode: "daily-minimum",
        billableDays: 1,
        chargedHours: null,
        pricePerHourWeekday: Number((pricePerDay / 24).toFixed(2)),
        pricePerHourWeekend: Number((pricePerDay / 24 * 1.1).toFixed(2)), // informative
        totalAmount: pricePerDay,
        breakdown: { weekdayHours: 0, weekendHours: 0 },
      };
    } else {
      const fullDays = Math.floor(totalHours / 24);
      const remainder = totalHours - fullDays * 24;
      if (Math.abs(remainder) < 1e-9) {
        response = {
          mode: "daily-exact",
          billableDays: fullDays,
          chargedHours: null,
          pricePerHourWeekday: Number((pricePerDay / 24).toFixed(2)),
          pricePerHourWeekend: Number((pricePerDay / 24 * 1.1).toFixed(2)),
          totalAmount: fullDays * pricePerDay,
          breakdown: { weekdayHours: 0, weekendHours: 0 },
        };
      } else {
        response = calcWeekendRemainderPricing(start, end, pricePerDay);
      }
    }

    return res.status(200).json({
      success: true,
      available: violations.length === 0 && !overlap,
      currency: "INR",
      hours: Number(totalHours.toFixed(2)),
      pricePerDay,
      pricePerHourWeekday: response.pricePerHourWeekday,
      pricePerHourWeekend: response.pricePerHourWeekend,
      billableDays: response.billableDays,
      chargedHours: response.remainderHours ?? response.chargedHours ?? null,
      totalAmount: response.totalAmount,
      mode: response.mode,
      breakdown: response.breakdown,
      minLeadHours: MIN_LEAD_HOURS,
      minDurationHours: MIN_DURATION_HOURS,
      overlap: !!overlap,
      code: violations[0]?.code || (overlap ? "DATES_OVERLAP" : null),
      message:
        violations[0]?.message ||
        (overlap ? "Selected dates overlap with an existing booking." : null),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Require renter role
    const renter = await User.findById(userId).select("verified role");
    if (!renter) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if ((renter.role && renter.role !== "renter") || (req.user?.role && req.user.role !== "renter")) {
      return res
        .status(403)
        .json({ success: false, code: "ROLE_NOT_ALLOWED", message: "Only renter accounts can create bookings." });
    }
    if (renter.verified !== true) {
      return res
        .status(403)
        .json({ success: false, code: "USER_NOT_VERIFIED", message: "Please verify your account to book." });
    }

    const { carId, pickupAt, dropoffAt, paymentMethod = "cod", pickupNote } = req.body || {};
    const start = toDate(pickupAt);
    const end = toDate(dropoffAt);
    if (!carId || !start || !end || end <= start) {
      return res.status(400).json({ success: false, message: "Invalid inputs" });
    }

    const now = new Date();
    if (start.getTime() < now.getTime() + MIN_LEAD_HOURS * HOUR_MS) {
      return res
        .status(400)
        .json({ success: false, code: "PICKUP_TOO_SOON", message: `Pickup must be at least ${MIN_LEAD_HOURS} hours from now.` });
    }
    const totalHours = hoursBetween(start, end);
    if (totalHours < MIN_DURATION_HOURS) {
      return res
        .status(400)
        .json({ success: false, code: "DURATION_TOO_SHORT", message: `Minimum rental duration is ${MIN_DURATION_HOURS} hours.` });
    }

    const car = await Car.findById(carId).populate("owner");
    if (!car) return res.status(404).json({ success: false, message: "Car not found" });
    if (car.availability === false) {
      return res.status(400).json({ success: false, message: "Car unavailable" });
    }

    const overlap = await hasOverlap(car._id, start, end);
    if (overlap) {
      return res.status(409).json({ success: false, message: "Selected dates not available" });
    }

    const pricePerDay = Number(car.pricePerDay || 0);

    let pricing;
    if (totalHours <= 24) {
      pricing = {
        totalAmount: pricePerDay,
      };
    } else {
      const fullDays = Math.floor(totalHours / 24);
      const remainder = totalHours - fullDays * 24;
      if (Math.abs(remainder) < 1e-9) {
        pricing = { totalAmount: fullDays * pricePerDay };
      } else {
        const calc = calcWeekendRemainderPricing(start, end, pricePerDay);
        pricing = { totalAmount: calc.totalAmount };
      }
    }

    const booking = await Booking.create({
      car: car._id,
      user: userId,
      owner: car.owner?._id || car.owner,
      pickupAt: start,
      dropoffAt: end,
      pricePerDay,
      totalAmount: pricing.totalAmount,
      pickupNote,
      status: "confirmed",
      payment: { method: paymentMethod, status: "unpaid" },
    });

    try {
      const carSnap = {
        name: car.name || `${car.brand || ""} ${car.model || ""}`.trim(),
        brand: car.brand,
        model: car.model,
        carnumber: car.carnumber,
      };
      const paidNow = booking.payment?.status === "paid";
      const amount = Number(booking.totalAmount || booking.amount || 0);

      // Ensure owner credit exists and is correct
      await Transaction.updateOne(
        { booking: booking._id, owner: booking.owner, type: "booking" },
        {
          $setOnInsert: {
            owner: booking.owner,
            booking: booking._id,
            car: carSnap,
            type: "booking",
            direction: "credit",
            amount,
            currency: "INR",
            note: `Booking ${booking._id} owner credit`,
          },
          $set: { status: paidNow ? "paid" : "pending" },
        },
        { upsert: true }
      );

      await Transaction.updateOne(
        { booking: booking._id, renter: booking.user, type: "booking" },
        {
          $setOnInsert: {
            renter: booking.user,
            booking: booking._id,
            car: carSnap,
            type: "booking",
            direction: "debit",
            amount,
            currency: "INR",
            note: `Booking ${booking._id} renter debit`,
          },
          $set: { status: paidNow ? "paid" : "pending" },
        },
        { upsert: true }
      );
    } catch (e) {
      console.error("log booking transactions failed:", e?.message || e);
    }

    return res.status(201).json({
      success: true,
      booking,
    });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id)
      .populate("car")
      .populate("user", "name email")
      .populate("owner", "name email");
    if (!b) return res.status(404).json({ success: false, message: "Not found" });

    const uid = String(req.user?._id || req.user?.id || req.user?.userId || "");
    if (req.user?.role !== "admin") {
      if (String(b.user) !== uid && String(b.owner) !== uid) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }
    return res.json({ success: true, booking: b });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listBookings = async (req, res) => {
  try {
    const scope = req.query.scope || "me";
    const uid = req.user?._id;
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const filter = scope === "owner" ? { owner: uid } : scope === "admin" ? {} : { user: uid };

    const items = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "car",
        select: "brand model name images image carnumber location pricePerDay owner",
        populate: { path: "owner", select: "name phone email" },
      })
      .populate("owner", "name phone email")
      // include nested license URL
      .populate("user", "name phone email document.Driving_License_URL document.Driving_License");

    return res.json({ success: true, bookings: items });
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRenterLicensePdf = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const uid = req.user?._id;
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const booking = await Booking.findById(bookingId).select("user owner status");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Allow only booking owner or the renter to access
    const isOwner = String(booking.owner) === String(uid);
    const isRenter = String(booking.user) === String(uid);
    if (!isOwner && !isRenter) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Show license only for confirmed bookings
    if (booking.status !== "confirmed" && !isRenter) {
      return res.status(403).json({ success: false, message: "License available after confirmation" });
    }

    const renter = await User.findById(booking.user).select("document.Driving_License_URL");
    const fileRef = renter?.document?.Driving_License_URL;
    if (!fileRef) return res.status(404).json({ success: false, message: "License not uploaded" });

    // If it's an external URL, redirect
    if (/^https?:\/\//i.test(fileRef)) {
      return res.redirect(fileRef);
    }

    // Otherwise, treat as local path (e.g., uploads/licenses/xyz.pdf)
    const absPath = path.isAbsolute(fileRef)
      ? fileRef
      : path.join(process.cwd(), fileRef.replace(/^(\.\/)/, ""));
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ success: false, message: "License file not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="license.pdf"');
    const stream = fs.createReadStream(absPath);
    stream.on("error", () => res.status(500).end());
    stream.pipe(res);
  } catch {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("car");
    if (!booking) return res.status(404).json({ success: false, message: "Not found" });

    const uid = String(req.user?._id || "");
    // Allow renter, owner, or admin to cancel
    if (
      String(booking.user) !== uid &&
      String(booking.owner) !== uid &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Block cancelling completed bookings
    if (String(booking.status).toLowerCase() === "completed") {
      return res.status(400).json({ success: false, message: "Completed bookings cannot be cancelled" });
    }
    // If already cancelled, return early
    if (String(booking.status).toLowerCase() === "cancelled") {
      return res.json({ success: true, booking, message: "Already cancelled" });
    }

    // 3-hour window before pickup (applies to owner and renter)
    const now = Date.now();
    const pickupTs = new Date(booking.pickupAt).getTime();
    if (!Number.isFinite(pickupTs)) {
      return res.status(400).json({ success: false, message: "Invalid pickup time" });
    }
    const cutoffTs = pickupTs - MIN_LEAD_HOURS * HOUR_MS; // MIN_LEAD_HOURS = 3
    if (now >= cutoffTs) {
      return res.status(400).json({
        success: false,
        code: "CANCEL_WINDOW_PASSED",
        message: `Cancellation allowed only until ${MIN_LEAD_HOURS} hours before pickup.`,
      });
    }

    // Change booking status
    booking.status = "cancelled";
    await booking.save();

    // Update both debit and credit transactions
    await Transaction.updateMany(
      { booking: booking._id },
      { $set: { type: "cancel", status: "refunded" } }
    );

    return res.json({ success: true, booking });
  } catch (err) {
    console.error("Cancel booking failed:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


async function logRefund(booking, carDoc, amount) {
  try {
    const ownerId = carDoc.owner?._id || carDoc.owner;
    const renterId = booking.user || booking.renter || booking.userId;
    const carSnap = {
      name: carDoc.name || `${carDoc.brand || ""} ${carDoc.model || ""}`.trim(),
      brand: carDoc.brand,
      model: carDoc.model,
      carnumber: carDoc.carnumber,
    };
    await Transaction.create([
      {
        owner: ownerId,
        booking: booking._id,
        car: carSnap,
        type: "refund",
        direction: "debit",     // money out from owner
        status: "refunded",
        amount: Math.abs(Number(amount || 0)),
        currency: "INR",
        note: `Refund for booking ${booking._id}`,
      },
      {
        renter: renterId,
        booking: booking._id,
        car: carSnap,
        type: "refund",
        direction: "credit",    // money back to renter
        status: "refunded",
        amount: Math.abs(Number(amount || 0)),
        currency: "INR",
        note: `Refund for booking ${booking._id}`,
      },
    ]);
  } catch (e) {
    console.error("logRefund failed:", e?.message || e);
  }
}

// NEW: logBookingTransactions function
async function logBookingTransactions(booking, carDoc) {
  try {
    const ownerId = carDoc.owner?._id || carDoc.owner;
    const renterId = booking.user || booking.renter || booking.userId; // adjust to your schema
    const carSnap = {
      name: carDoc.name || `${carDoc.brand || ""} ${carDoc.model || ""}`.trim(),
      brand: carDoc.brand,
      model: carDoc.model,
      carnumber: carDoc.carnumber,
    };
    const paidNow = booking.payment?.status === "paid";
    const amount = Number(booking.totalAmount || booking.amount || 0);

    await Transaction.create([
      {
        owner: ownerId,
        booking: booking._id,
        car: carSnap,
        type: "booking",
        direction: "credit",
        status: paidNow ? "paid" : "pending",
        amount,
        currency: "INR",
        note: `Booking ${booking._id} owner credit`,
      },
      {
        renter: renterId,
        booking: booking._id,
        car: carSnap,
        type: "booking",
        direction: "debit",    // renter pays
        status: paidNow ? "paid" : "pending",
        amount,
        currency: "INR",
        note: `Booking ${booking._id} renter debit`,
      },
    ]);
  } catch (e) {
    console.error("logBookingTransactions failed:", e?.message || e);
  }
}

const ensureDir = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
};
const completionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bId = String(req.params?.id || "misc");
    const dest = path.join(process.cwd(), "uploads", "booking-completions", bId);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ts = Date.now();
    const rnd = Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname || "");
    cb(null, `${file.fieldname}-${ts}-${rnd}${ext}`);
  },
});
export const completeUpload = multer({
  storage: completionStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

async function logExtraChargeTransactions(booking, carDoc, label, amount) {
  try {
    const ownerId = carDoc.owner?._id || carDoc.owner;
    const renterId = booking.user || booking.renter || booking.userId;
    const carSnap = {
      name: carDoc.name || `${carDoc.brand || ""} ${carDoc.model || ""}`.trim(),
      brand: carDoc.brand,
      model: carDoc.model,
      carnumber: carDoc.carnumber,
    };
    const amt = Math.abs(Number(amount || 0));
    if (!(amt > 0)) return;

    const status = "pending";
    await Transaction.create([
      {
        owner: ownerId,
        booking: booking._id,
        car: carSnap,
        type: "fee",
        direction: "credit",
        status,
        amount: amt,
        currency: "INR",
        note: `${label} for booking ${booking._id}`,
      },
      {
        renter: renterId,
        booking: booking._id,
        car: carSnap,
        type: "fee",
        direction: "debit",
        status,
        amount: amt,
        currency: "INR",
        note: `${label} for booking ${booking._id}`,
      },
    ]);
  } catch (e) {
    console.error("logExtraChargeTransactions failed:", e?.message || e);
  }
}

export const completeBooking = async (req, res) => {
  try {
    const uid = req.user?._id;
    if (!uid) return res.status(401).json({ success: false, message: "Unauthorized" });

    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate("car");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const isOwner = String(booking.owner) === String(uid);
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const now = Date.now();
    const dropTs = new Date(booking.dropoffAt).getTime();
    if (!Number.isFinite(dropTs)) {
      return res.status(400).json({ success: false, message: "Invalid dropoff time" });
    }
    if (now < dropTs - HOUR_MS) {
      return res.status(400).json({
        success: false,
        code: "TOO_EARLY",
        message: "Can only complete within 1 hour of dropoff time.",
      });
    }
    if (String(booking.status).toLowerCase() === "completed") {
      return res.json({ success: true, booking, message: "Already completed" });
    }
    if (String(booking.status).toLowerCase() === "cancelled") {
      return res.status(400).json({ success: false, message: "Cancelled booking cannot be completed" });
    }

    const carInspected =
      /^true$/i.test(String(req.body?.carInspected || "")) || req.body?.carInspected === "1";
    const notes = String(req.body?.notes || "").slice(0, 2000);

    const challanAmount = Number(req.body?.challanAmount ?? req.body?.challanLink ?? 0);
    const fastagAmount = Number(req.body?.fastagAmount ?? req.body?.fastagLink ?? 0);

    const challanFiles = Array.isArray(req.files?.challanProof) ? req.files.challanProof : (req.files?.challanProof ? [req.files.challanProof] : []);
    const tollFiles = Array.isArray(req.files?.tollProof) ? req.files.tollProof : (req.files?.tollProof ? [req.files.tollProof] : []);
    const norm = (f) =>
      f
        .filter(Boolean)
        .map((x) =>
          path
            .relative(process.cwd(), x.path)
            .replace(/\\/g, "/")
        );
    const challanProof = norm(challanFiles || []);
    const tollProof = norm(tollFiles || []);

    booking.status = "completed";
    booking.completedAt = new Date();
    booking.completedBy = req.user?._id || booking.completedBy;
    booking.completion = {
      carInspected: !!carInspected,
      notes,
      challanAmount: Number.isFinite(challanAmount) ? challanAmount : 0,
      fastagAmount: Number.isFinite(fastagAmount) ? fastagAmount : 0,
      challanProof,
      tollProof,
      approval,
    };
    if (typeof booking.markModified === "function") booking.markModified("completion");
    await booking.save();

    if (Number(challanAmount) > 0) {
      await logExtraChargeTransactions(booking, booking.car, "Challan charges", challanAmount);
    }
    if (Number(fastagAmount) > 0) {
      await logExtraChargeTransactions(booking, booking.car, "FASTag/Toll charges", fastagAmount);
    }

    return res.json({
      success: true,
      booking,
      charges: {
        challanAmount: Number.isFinite(challanAmount) ? challanAmount : 0,
        fastagAmount: Number.isFinite(fastagAmount) ? fastagAmount : 0,
      },
      proofs: { challanProof, tollProof },
      message: "Ride completed",
    });
  } catch (e) {
    console.error("completeBooking error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};