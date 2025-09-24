import mongoose from "mongoose";

const payoutDetailsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  accountHolder: { type: String, required: true },
});

const PayoutDetails = mongoose.model("PayoutDetails", payoutDetailsSchema);

export default PayoutDetails;