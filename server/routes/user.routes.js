import express from "express";
import {
  register,
  login,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Access: Public
router
  .post("/register", register)
  .post("/login", login)

  // Access: Private
  .get("/profile", protect, getUserProfile)
  .get("/", protect, getUserProfile)
  .get("/:id", protect, getUserProfile)
  .put("/profile", protect, admin, getUserProfile)
  .put("/password", protect, admin, getUserProfile)
  .delete("/:id", protect, admin, getUserProfile);

export default router;
