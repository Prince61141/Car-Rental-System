const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    carnumber: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },

    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric"], required: true },
    transmission: { type: String, enum: ["Manual", "Automatic"], required: true },
    seats: { type: Number, required: true },

    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      addressLine: { type: String },
      pincode: { type: String },
    },

    availability: { type: Boolean, default: true },

    image: [{ type: String }],

    documents: {
      rc: { type: String, required: true },
      insurance: { type: String, required: true },
      pollution: { type: String, required: true },
    },

    description: { type: String, required: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);