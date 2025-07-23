const express = require("express");
const router = express.Router();

const { getMe, lookupDocument, verifyOwner } = require("../controllers/ownerController");

router.get("/me", getMe);
router.post("/lookup-document", lookupDocument);
router.post("/verify-owner", verifyOwner);

module.exports = router;