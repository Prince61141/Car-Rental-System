import { Router } from "express";
import multer from "multer";
import {
  getAdminStats,
  listCompletedBookings,
  updateCompletionApproval,
  listTransactions,
  updateTransactionStatus,
  listUsers,
  getUserById,
  setUserVerification,
  uploadUserDocument,
} from "../controllers/adminController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.get("/stats", getAdminStats);

router.get("/bookings/completed", listCompletedBookings);
router.patch("/bookings/:id/approval", updateCompletionApproval);

router.get("/transactions", listTransactions);
router.patch("/transactions/:id/status", updateTransactionStatus);

router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/verify", setUserVerification);
router.post("/users/:id/document", upload.single("file"), uploadUserDocument);

export default router;