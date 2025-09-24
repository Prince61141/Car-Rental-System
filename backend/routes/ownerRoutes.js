import express from "express";
const router = express.Router();
import {getMe, lookupDocument, verifyOwner, multerInstance, updateMe, getPayoutDetails, savePayoutDetails, carReport, getOwnerNotifications } from "../controllers/ownerController.js"

router.get("/me", getMe);
router.post("/lookup-document", lookupDocument);
router.post("/verify-owner", verifyOwner);
router.put("/update", multerInstance.single("photo"), updateMe);
router.get("/payout", getPayoutDetails);
router.post("/payout", savePayoutDetails);
router.get("/car-report/:carId", carReport);
router.get("/notifications", getOwnerNotifications);

export default router;