import express from "express";
import { multerInstance, addMyCar, getMyCars, getallCars, getCarById, updateCar ,updateCarAvailability } from "../controllers/carController.js";

const router = express.Router();

router.post(
  "/addcar",
  multerInstance.fields([
    { name: "images", maxCount: 5 },
    { name: "rc", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
    { name: "pollution", maxCount: 1 },
  ]),
  addMyCar
);

router.get("/:id/details", getCarById);
router.patch("/:id/update", updateCar);
router.get("/mycars", getMyCars);
router.get("/allcars", getallCars);
router.patch("/:id/availability", updateCarAvailability);

export default router;