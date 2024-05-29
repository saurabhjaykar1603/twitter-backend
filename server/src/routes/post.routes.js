import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  likeUnlikePost,
} from "../controllers/post.controller.js";
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
router.post("/comment/:id", authMiddleware, commentOnPost);
router.post("/like/:id", authMiddleware, likeUnlikePost);

export default router;
