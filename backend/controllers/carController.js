import Car from "../models/Car.js";

export const getMyCars = async (req, res) => {
  try {
     const userId = "6860e5388aca95352643ec0c";
    const cars = await Car.find({ owner: req.userId });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};