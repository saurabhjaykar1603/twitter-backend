import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getallNotifications,deleteNotifications } from "../controllers/notification.controllers.js";

const router = Router();

router.get("/", authMiddleware, getallNotifications);
router.delete("/", authMiddleware, deleteNotifications);

export default router;
