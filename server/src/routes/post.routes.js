import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createPost, deletePost } from "../controllers/post.controller.js";
import { validateDeletePost } from "../middlewares/validateDeletePost.js";
import { deletePostRateLimiter } from "../middlewares/deletePostRateLimiter.js";

const router = Router();

router.post("/create", authMiddleware, createPost);
router.delete(
  "/:id",
  authMiddleware,
  deletePostRateLimiter,
  validateDeletePost,
  deletePost
);

export default router;
