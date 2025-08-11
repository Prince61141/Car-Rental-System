import express from "express";
const router = express.Router();
import {
  getAllCities,
  quote,
  createBooking,
  getBooking,
  listBookings,
  getRenterLicensePdf,
  cancelBooking,
} from "../controllers/bookingController.js";
import auth from "../middleware/authMiddleware.js";

router.get("/cities", getAllCities);
router.post("/quote", quote);

router.use(auth);
router.post("/", createBooking);
router.get("/", listBookings);
router.get("/:id", getBooking);
router.get("/:id/renter-license", auth, getRenterLicensePdf);
router.patch("/:id/cancel", cancelBooking);

export default router;