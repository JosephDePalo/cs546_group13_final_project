import express from "express";
import {
  renderHome,
  renderRegister,
  renderLogin,
  renderLeaderboard,
  renderNewEvent,
  renderEventManagement,
  renderNewReport,
  renderEditProfile,
  renderEvent,
  renderEventsList,
} from "../controllers/pages.controller.js";
import { exampleProtectedPage } from "../controllers/pages.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", (req, res) => res.redirect("/home"));

router.get("/home", renderHome);

router.get("/example-protected", protect, exampleProtectedPage);

router.get("/register", renderRegister);
router.get("/login", renderLogin);

router.get("/leaderboard", renderLeaderboard);

router.get("/events/", renderEventsList);

router.get("/events/:id", renderEvent);

router.get("/event/new_event", renderNewEvent);
``;
router.get("/event/manage/:id", renderEventManagement);

router.get("/user/edit/:id", renderEditProfile);

router.get("/report/event/:id", (req, res) =>
  renderNewReport(req, res, "event"),
);
router.get("/report/user/:id", (req, res) => renderNewReport(req, res, "user"));

router.get("/report/comment/:id", (req, res) =>
  renderNewReport(req, res, "comment"),
);

// EXAMPLE PROTECTED PAGE
// router.get("/profile" , protect, renderProfile)

// EXAMPLE PROTECTED ADMIN ONLY PAGE
// router.get("/allusers" , protect, admin, renderAllUsers)

export default router;
