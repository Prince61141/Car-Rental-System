import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

const toInt = (v, d = 0) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAdminStats = async (req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled, txnCount, txnSumAgg] =
      await Promise.all([
        Booking.countDocuments({}),
        Booking.countDocuments({ status: "pending" }),
        Booking.countDocuments({ status: "confirmed" }),
        Booking.countDocuments({ status: "completed" }),
        Booking.countDocuments({ status: "cancelled" }),
        Transaction.countDocuments({}),
        Transaction.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);
    const txnTotalAmount = txnSumAgg?.[0]?.total || 0;

    return res.json({
      success: true,
      stats: {
        bookings: { total, pending, confirmed, completed, cancelled },
        transactions: { total: txnCount, amount: txnTotalAmount },
      },
    });
  } catch (e) {
    console.error("getAdminStats error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listCompletedBookings = async (req, res) => {
  try {
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 10);
    const skip = (page - 1) * limit;

    const approval = String(req.query.approval || "").toLowerCase(); // pending|approved|rejected
    const q = { status: "completed" };
    if (["pending", "approved", "rejected"].includes(approval)) {
      q["completion.approval"] = approval;
    }

    const [items, total] = await Promise.all([
      Booking.find(q)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: "car", select: "name brand model carnumber pricePerDay images owner" },
          { path: "user", select: "fullName name username email phone mobile" },
          { path: "completedBy", select: "fullName name username email" },
          { path: "car.owner", select: "fullName name username email phone mobile" },
        ])
        .lean(),
      Booking.countDocuments(q),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      items,
    });
  } catch (e) {
    console.error("listCompletedBookings error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCompletionApproval = async (req, res) => {
  try {
    const { id } = req.params; // booking id
    const decision = String(req.body?.decision || "").toLowerCase(); // approved|rejected|pending
    const adminNote = String(req.body?.note || "").slice(0, 1000);

    if (!["approved", "rejected", "pending"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Invalid decision" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Only completed bookings can be moderated" });
    }

    booking.completion = {
      ...(booking.completion || {}),
      approval: decision,
      adminNote,
    };
    booking.markModified?.("completion");
    await booking.save();

    return res.json({ success: true, booking });
  } catch (e) {
    console.error("updateCompletionApproval error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 10, 10);
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim().toLowerCase();
    const typeRaw = String(req.query.type || "").trim();
    const party = String(req.query.party || "").trim().toLowerCase();   // renter|owner
    const effect = String(req.query.effect || "").trim().toLowerCase(); // debit|credit

    const q = {};
    if (status) q.status = status;
    if (typeRaw) q.type = new RegExp(`^${escapeRegex(typeRaw)}$`, "i");
    if (party === "renter") q.renter = { $ne: null };
    if (party === "owner") q.owner = { $ne: null };
    // Do not assume a specific effect field; we’ll classify after fetch.

    const total = await Transaction.countDocuments(q);

    let items = await Transaction.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .setOptions({ strictPopulate: false })
      // renter/owner (keep your existing populates)
      .populate({ path: "renter", select: "fullName name username email phone role", options: { strictPopulate: false } })
      .populate({ path: "owner", model: "User", select: "fullName name username email phone role", options: { strictPopulate: false } })
      // booking + nested car
      .populate({
        path: "booking",
        select: "status car user renter",
        options: { strictPopulate: false },
        populate: [
          // ensure car object is loaded
          {
            path: "car",
            select: "brand make model name carnumber plate reg registrationNumber numberPlate",
            options: { strictPopulate: false },
          },
          // optional: load booking user/renter if you show them anywhere
          { path: "user", select: "fullName name username email role", options: { strictPopulate: false } },
          { path: "renter", select: "fullName name username email role", options: { strictPopulate: false } },
        ],
      })
      // also support direct transaction.car if present in your schema
      .populate({
        path: "car",
        select: "brand make model name carnumber plate reg registrationNumber numberPlate",
        options: { strictPopulate: false },
      })
      .lean();

    // Classify party/effect for UI and filtering
    const classify = (t) => {
      const type = String(t.type || "").toLowerCase();
      // Party: prefer explicit ids
      const partyC = t.renter ? "renter" : "owner";
      // Effect defaults: renter->debit, owner->credit; adjust by type keywords
      let effectC = partyC === "renter" ? "debit" : "credit";
      if (/refund/.test(type)) effectC = "credit";          // renter gets money back
      if (/payout|settlement/.test(type)) effectC = "credit"; // owner payout
      if (/owner[_-]?(fee|charge|debit)/.test(type)) effectC = "debit"; // owner fee

      const displayUser = partyC === "renter" ? t.renter || t.owner : t.owner || t.renter;
      return { party: partyC, effect: effectC, displayUser };
    };

    items = items
      .map((t) => ({ ...t, computed: classify(t) }))
      .filter((t) => (effect ? t.computed.effect === effect : true));

    return res.json({ success: true, page, limit, total, items });
  } catch (e) {
    console.error("listTransactions error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "").toLowerCase();
    const allowed = new Set(["paid", "pending", "processing", "failed", "refunded"]);
    if (!allowed.has(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const t = await Transaction.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    )
      .setOptions({ strictPopulate: false })
      .populate({ path: "renter", select: "fullName name username email phone role" })
      .populate({ path: "owner", model: "User", select: "fullName name username email phone role" })
      .lean();

    if (!t) return res.status(404).json({ success: false, message: "Transaction not found" });
    return res.json({ success: true, item: t });
  } catch (e) {
    console.error("updateTransactionStatus error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// LIST USERS (filter by verified/new)
export const listUsers = async (req, res) => {
  try {
    const page = toInt(req.query.page, 1);
    const limit = toInt(req.query.limit, 10);
    const skip = (page - 1) * limit;

    const q = {};
    // verified filter
    if (typeof req.query.verified !== "undefined" && req.query.verified !== "") {
      const v = String(req.query.verified).toLowerCase();
      if (["true", "false"].includes(v)) q.verified = v === "true";
    }
    // role filter (optional)
    if (req.query.role) q.role = req.query.role;

    // citizenship filter (indian|foreigner), case-insensitive, supports multiple field names
    const nat = String(req.query.citizenship || req.query.nationality || "")
      .trim()
      .toLowerCase();
    if (nat === "indian" || nat === "foreigner") {
      const rx = new RegExp(`^${nat}$`, "i");
      q.$or = [
        { Citizenship: rx },
        { citizenship: rx },
        { nationality: rx },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name fullName username email phone role verified createdAt document Citizenship citizenship nationality"
        )
        .lean(),
      User.countDocuments(q),
    ]);

    return res.json({ success: true, page, limit, total, items });
  } catch (e) {
    console.error("listUsers error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id)
      .select(
        "name fullName username email phone role verified createdAt updatedAt address Citizenship photo document"
      )
      .lean();
    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, user: u });
  } catch (e) {
    console.error("getUserById error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// VERIFY/UNVERIFY USER
export const setUserVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const verified = String(req.body?.verified).toLowerCase() === "true";
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    u.verified = verified;
    await u.save();
    return res.json({ success: true, user: u });
  } catch (e) {
    console.error("setUserVerification error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadUserDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const typeRaw = String(req.body?.type || "").trim(); // Aadhar|PAN|Driving_License|Passport
    const valueRaw = String(req.body?.value || "").trim(); // doc number
    const allowed = new Set(["Aadhar", "PAN", "Driving_License", "Passport"]);
    if (!allowed.has(typeRaw))
      return res.status(400).json({ success: false, message: "Invalid document type" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let url = String(req.body?.url || "").trim();

    // If a file was sent, upload to Cloudinary
    if (req.file && req.file.buffer) {
      const folder = `users/${id}/${typeRaw.toLowerCase()}`;
      const uploadRes = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "auto" },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(req.file.buffer);
      });
      url = uploadRes?.secure_url || uploadRes?.url || url;
    }

    if (!url && !valueRaw) {
      return res.status(400).json({
        success: false,
        message: "Provide a file or url or value to update",
      });
    }

    // Update user.document fields
    user.document = user.document || {};
    if (valueRaw) {
      user.document[typeRaw] = valueRaw;
    }
    if (url) {
      user.document[`${typeRaw}_URL`] = url;
    }
    await user.save();

    return res.json({
      success: true,
      user,
      updated: { type: typeRaw, value: valueRaw || undefined, url: url || undefined },
    });
  } catch (e) {
    console.error("uploadUserDocument error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};