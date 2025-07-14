const express = require("express");
const router = express.Router();
const { getMyCars } = require("../controllers/carController.js");

router.post("/my", getMyCars);

module.exports = router;