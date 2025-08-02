import express from "express";
const router = express.Router();
import {
  multerInstance,
  verifyIndianRenter,
  verifyForeignerRenter,
} from "../controllers/renterController.js";

router.post(
  "/verify-indian",
  multerInstance.fields([{ name: "licencePhoto", maxCount: 1 }]),
  verifyIndianRenter
);

router.post(
  "/verify-foreigner",
  multerInstance.fields([
    { name: "photo", maxCount: 1 },
    { name: "licencePhoto", maxCount: 1 },
  ]),
  verifyForeignerRenter
);

export default router;
