import { Router } from "express";
import {
  getOwnerTransactions,
  getRenterTransactions,
  cancelBookingTransactions,
} from "../controllers/transactionController.js";

const router = Router();

router.get("/owner", getOwnerTransactions);
router.get("/renter", getRenterTransactions);
router.post("/booking/:bookingId/cancel", cancelBookingTransactions);

export default router;