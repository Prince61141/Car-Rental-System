import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pickupAt: { type: Date, required: true, index: true },
    dropoffAt: { type: Date, required: true, index: true },

    pricePerDay: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    pickupNote: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
    payment: {
      method: { type: String, enum: ["cod", "online"], default: "cod" },
      status: {
        type: String,
        enum: ["unpaid", "paid", "refunded"],
        default: "unpaid",
      },
      transactionId: { type: String },
    },

    completion: {
      carInspected: { type: Boolean, default: false },
      notes: { type: String, default: "" },

      challanAmount: { type: Number, default: 0 },
      fastagAmount: { type: Number, default: 0 },
      lateTime: { type: Number, default: 0 },
      latefeeAmount: { type: Number, default: 0 },

      challanProof: [{ type: String }],
      tollProof: [{ type: String }],
      lateMinutes: { type: Number, default: 0 },
      lateHours: { type: Number, default: 0 },
      lateFee: { type: Number, default: 0 },
      approval: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

bookingSchema.index({ car: 1, pickupAt: 1, dropoffAt: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
