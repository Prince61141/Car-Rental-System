import express from "express";
const router = express.Router();

import { getAllCities } from "../controllers/Booking.js";

router.get("/cities", getAllCities);

export default router;