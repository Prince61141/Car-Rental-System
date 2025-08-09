import Car from "../models/Car.js";

export const getAllCities = async (req, res) => {
  try {
    const cities = await Car.distinct("location.city");
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch cities", error: err.message });
  }
};