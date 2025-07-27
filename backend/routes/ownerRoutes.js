const express = require("express");
const router = express.Router();

const { getMe, lookupDocument, verifyOwner, updateMe } = require("../controllers/ownerController");

router.get("/me", getMe);
router.post("/lookup-document", lookupDocument);
router.post("/verify-owner", verifyOwner);
router.put("/update", updateMe);

module.exports = router;