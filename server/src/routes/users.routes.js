import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserProfile } from "../controllers/user.controller.js";

const router = Router();
router.get("/profile/:username", authMiddleware, getUserProfile);

export default router;
