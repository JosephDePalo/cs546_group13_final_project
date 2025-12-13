import express from "express";
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getUsers,
  getUserById,
  deleteUser,
  logout,
  updateUserById,
} from "../controllers/user.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

// Private routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put("/password", protect, updatePassword);

// Admin routes
router.get("/", protect, admin, getUsers);

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUserById);

export default router;
