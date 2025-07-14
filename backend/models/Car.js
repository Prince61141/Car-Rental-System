const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    title: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },

    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      addressLine: { type: String },
      pincode: { type: String },
    },
      
    availability: { type: Boolean, default: true },
    image: [{ type: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);
