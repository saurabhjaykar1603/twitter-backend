import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getUserProfile,
  followUnFollowUser,
  fetchSuggestedUsers,
} from "../controllers/user.controller.js";

const router = Router();
router.get("/profile/:username", authMiddleware, getUserProfile);
router.post("/follow/:id", authMiddleware, followUnFollowUser);
router.get("/suggested", authMiddleware, fetchSuggestedUsers);

export default router;
