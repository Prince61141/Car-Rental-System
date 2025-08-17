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
  completeBooking,
  completeUpload,
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
router.post(
  "/:id/complete",
  auth,
  completeUpload.fields([
    { name: "challanProof", maxCount: 5 },
    { name: "tollProof", maxCount: 5 },
  ]),
  completeBooking
);

export default router;