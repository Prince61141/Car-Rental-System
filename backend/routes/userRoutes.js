const express = require("express");
const router = express.Router();
const { registerUser, loginUser, requestOtp } = require("../controllers/userController");

// Routes
router.post("/register", registerUser);
router.post("/request-otp", requestOtp);
router.post("/login", loginUser);

module.exports = router;