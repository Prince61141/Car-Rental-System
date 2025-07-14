const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ["admin", "peer-owner", "renter", "fleet"],
    default: "renter",
  },
  password: String,
  document: String,
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);