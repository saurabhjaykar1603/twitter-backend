import { Router } from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/signup", signupUser);

router.get("/login", loginUser);

router.get("/logout", logoutUser);
export default router;
