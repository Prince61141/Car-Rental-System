import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    car: {
      name: String,
      brand: String,
      model: String,
      carnumber: String,
    },
    type: {
      type: String,
      enum: ["booking", "charges", "cancel"],
      required: true,
    },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    status: {
      type: String,
      enum: [
        "paid",
        "pending",
        "failed",
        "refunded",
        "processing",
      ],
      default: "pending",
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    note: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ owner: 1, createdAt: -1 });
TransactionSchema.index({ renter: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;