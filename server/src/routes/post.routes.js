import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createPost } from "../controllers/post.controller.js";

const router = Router();

router.post("/create", authMiddleware, createPost);

export default router;
