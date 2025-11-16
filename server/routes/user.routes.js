import express from "express";
import {
  register,
  login,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Access: Public
router.post("/register", register);
router.post("/login", login);

// Access: Private
router.get("/profile", protect, getUserProfile);

export default router;
