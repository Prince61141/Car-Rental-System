import express from "express";
const router = express.Router();
import authenticateToken from "../middleware/authMiddleware.js";
import { registerWithPhone, loginUser, verifyPhoneOtp, forgotPassword, resetPassword, resendOtp, changePassword } from "../controllers/userController.js";

// Routes
router.post("/users/register", registerWithPhone);
router.post("/users/verify-otp", verifyPhoneOtp);
router.post("/users/login", loginUser);
router.post("/users/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/users/change-password", changePassword);

router.get("/admin/dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  res.json({ success: true, user: req.user });
});

router.get("/renter/dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "renter") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  res.json({ success: true, user: req.user });
});

router.get("/peer-owner/dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "peer-owner") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  res.json({ success: true, user: req.user });
});

router.get("/fleet/dashboard", authenticateToken, (req, res) => {
  if (req.user.role !== "fleet") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  res.json({ success: true, user: req.user });
});

export default router;