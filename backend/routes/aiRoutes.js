import { Router } from "express";
import { aiChat } from "../controllers/aiController.js";

const router = Router();
router.post("/ai/chat", aiChat);
export default router;