import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import renterRoutes from "./routes/renterRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/renters", renterRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("🚗 Car Rental API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});