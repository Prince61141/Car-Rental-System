import express from "express";
const router = express.Router();
import {getMe, lookupDocument, verifyOwner, multerInstance, updateMe} from "../controllers/ownerController.js";

router.get("/me", getMe);
router.post("/lookup-document", lookupDocument);
router.post("/verify-owner", verifyOwner);
router.put("/update", multerInstance.single("photo"), updateMe);

export default router;