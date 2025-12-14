import express from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
  deleteUser,
  logout,
  updateUserById,
} from "../controllers/user.controller.js";
import {
  isLoggedIn,
  isAdminOrTargetUser,
  isNotLoggedIn,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", isNotLoggedIn, register);
router.post("/login", isNotLoggedIn, login);
router.get("/logout", isLoggedIn, logout);

// router
//   .route("/profile")
//   .get(isLoggedIn, getUserProfile)
//   .put(isLoggedIn, updateUserProfile);

// router.put("/password", isLoggedIn, updatePassword);

router.get("/", isLoggedIn, getUsers);

router
  .route("/:id")
  .get(isLoggedIn, getUserById)
  .delete(isLoggedIn, isAdminOrTargetUser, deleteUser)
  .put(isLoggedIn, isAdminOrTargetUser, updateUserById);

export default router;
