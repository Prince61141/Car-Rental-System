import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    carnumber: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },

    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"], required: true },
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
    rating: {type: Number, default: 4.5},

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);
export default Car;