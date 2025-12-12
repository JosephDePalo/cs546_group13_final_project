import express from "express";
import {
  renderHome,
  renderRegister,
  renderLogin,
} from "../controllers/pages.controller.js";
import { exampleProtectedPage } from "../controllers/pages.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/home", renderHome);

router.get("/example-protected", protect, exampleProtectedPage);

router.get("/register", renderRegister);
router.get("/login", renderLogin);

// EXAMPLE PROTECTED PAGE
// router.get("/profile" , protect, renderProfile)

// EXAMPLE PROTECTED ADMIN ONLY PAGE
// router.get("/allusers" , protect, admin, renderAllUsers)

export default router;
