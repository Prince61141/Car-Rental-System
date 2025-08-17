import Transaction from "../models/Transaction.js";
import Booking from "../models/Booking.js";

const asNum = (v) => (typeof v === "number" ? v : Number(v || 0));
const ok = (s) => ["paid", "success"].includes(String(s).toLowerCase());

export const getOwnerTransactions = async (req, res) => {
  try {
    const ownerId =
      req.query.ownerId || req.params.ownerId || req.header("x-owner-id") || req.body.ownerId;
    if (!ownerId) return res.status(400).json({ success: false, message: "ownerId required" });

    const txns = await Transaction.find({ owner: ownerId })
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    let paidCredits = 0,
      pendingPayout = 0,
      monthEarnings = 0;
    for (const t of txns) {
      const amt = Math.abs(asNum(t.amount));
      const status = String(t.status || "").toLowerCase();
      const type = String(t.type || "").toLowerCase();
      const dir = String(t.direction || "").toLowerCase();
      if (dir === "credit" && ok(status)) paidCredits += amt;
      if (
        ["payout", "withdrawal"].includes(type) &&
        ["pending", "processing"].includes(status)
      )
        pendingPayout += amt;
      const d = new Date(t.createdAt);
      if (
        dir === "credit" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
        monthEarnings += amt;
    }

    return res.json({
      success: true,
      transactions: txns,
      balance: Math.max(0, paidCredits - pendingPayout),
      pendingPayout,
      monthEarnings,
      lifetimeEarnings: paidCredits,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("getOwnerTransactions error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRenterTransactions = async (req, res) => {
  try {
    const renterId =
      req.query.renterId || req.params.renterId || req.header("x-renter-id") || req.body.renterId;
    if (!renterId) return res.status(400).json({ success: false, message: "renterId required" });

    const renterTx = await Transaction.find({ renter: renterId, direction: "debit" }).lean();

    const bookings = await Booking.find({ user: renterId }).select("_id").lean();
    const bookingIds = bookings.map((b) => b._id);
    const ownerOnlyTx = await Transaction.find({
      renter: { $exists: false },
      booking: { $in: bookingIds },
      direction: "debit",
    }).lean();

    const txns = [...renterTx, ...ownerOnlyTx].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Summary over debits only
    const now = new Date();
    let monthSpent = 0,
      lifetimeSpent = 0,
      refundsReceived = 0,
      pendingPayments = 0;
    for (const t of txns) {
      const amt = Math.abs(asNum(t.amount));
      const status = String(t.status || "").toLowerCase();
      const d = new Date(t.createdAt);
      const thisMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

      lifetimeSpent += amt;
      if (thisMonth) monthSpent += amt;
      if (["pending", "processing", "unpaid"].includes(status)) pendingPayments += amt;
    }

    return res.json({
      success: true,
      transactions: txns,
      monthSpent,
      lifetimeSpent,
      refundsReceived,
      pendingPayments,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("getRenterTransactions error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const cancelBookingTransactions = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundAmount = 0 } = req.body;
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const carSnap = {
      name: booking.car?.name || undefined,
      brand: booking.car?.brand || undefined,
      model: booking.car?.model || undefined,
      carnumber: booking.car?.carnumber || undefined,
    };

    const ownerId = booking.owner || booking.car?.owner;
    const renterId = booking.user || booking.renter;

    await Transaction.updateMany(
      { booking: booking._id, type: "booking" },
      { $set: { status: "declined", amount: 0, note: "Booking cancelled" } }
    );

    if (ownerId) {
      await Transaction.updateOne(
        { booking: booking._id, owner: ownerId, type: "cancel" },
        {
          $setOnInsert: {
            owner: ownerId,
            booking: booking._id,
            car: carSnap,
            type: "cancel",
            direction: "debit", // informational, amount 0
            amount: 0,
            currency: "INR",
            note: `Booking ${booking._id} cancelled (owner)`,
          },
          $set: { status: "declined" },
        },
        { upsert: true }
      );
    }

    if (renterId) {
      await Transaction.updateOne(
        { booking: booking._id, renter: renterId, type: "cancel" },
        {
          $setOnInsert: {
            renter: renterId,
            booking: booking._id,
            car: carSnap,
            type: "cancel",
            direction: "debit", // informational, amount 0
            amount: 0,
            currency: "INR",
            note: `Booking ${booking._id} cancelled (renter)`,
          },
          $set: { status: "declined" },
        },
        { upsert: true }
      );
    }

    const amt = Number(refundAmount || 0);
    if (amt > 0 && ownerId && renterId) {
      await Transaction.create([
        {
          owner: ownerId,
          booking: booking._id,
          car: carSnap,
          type: "refund",
          direction: "debit", 
          status: "refunded",
          amount: amt,
          currency: "INR",
          note: `Refund for booking ${booking._id}`,
        },
        {
          renter: renterId,
          booking: booking._id,
          car: carSnap,
          type: "refund",
          direction: "credit",
          status: "refunded",
          amount: amt,
          currency: "INR",
          note: `Refund for booking ${booking._id}`,
        },
      ]);
    }

    return res.json({ success: true });
  } catch (e) {
    console.error("cancelBookingTransactions error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};