import mongoose from "mongoose";

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
  address: String,
  Citizenship: { type: String, default: "Indian" },
  photo: String,
  document: {
    Aadhar: { type: String, unique: true },
    PAN: { type: String, unique: true },
    Driving_License: { type: String, unique: true },
    Passport: { type: String, unique: true },
    Passport_URL: { type: String },
    Driving_License_URL: { type: String },
  },
  verified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);
export default User;