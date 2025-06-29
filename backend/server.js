const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();

connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.send("🚗 Car Rental API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});