import express from "express";
import {
  renderHome,
  renderRegister,
  renderLogin,
  renderLeaderboard,
  renderNewEvent,
  renderEventManagement,
} from "../controllers/pages.controller.js";
import { exampleProtectedPage } from "../controllers/pages.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/home", renderHome);

router.get("/example-protected", protect, exampleProtectedPage);

router.get("/register", renderRegister);
router.get("/login", renderLogin);

router.get("/leaderboard", renderLeaderboard);

router.get("/event/new_event", renderNewEvent);

router.get("/event/manage/:id", renderEventManagement);

// EXAMPLE PROTECTED PAGE
// router.get("/profile" , protect, renderProfile)

// EXAMPLE PROTECTED ADMIN ONLY PAGE
// router.get("/allusers" , protect, admin, renderAllUsers)

export default router;
