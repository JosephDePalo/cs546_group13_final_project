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
import {
  isAdminOrEventOrganizer,
  isAdminOrTargetUser,
  isLoggedIn,
  isNotLoggedIn,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", (req, res) => res.redirect("/home"));
router.get("/home", renderHome);
router.get("/leaderboard", renderLeaderboard);

router.get("/register", isNotLoggedIn, renderRegister);
router.get("/login", isNotLoggedIn, renderLogin);
router.get(
  "/user/edit/:id",
  isLoggedIn,
  isAdminOrTargetUser,
  renderEditProfile,
);

router.get("/events/", isLoggedIn, renderEventsList);
router.get("/events/:id", isLoggedIn, renderEvent);
router.get("/event/new_event", isLoggedIn, renderNewEvent);
router.get(
  "/event/manage/:id",
  isLoggedIn,
  isAdminOrEventOrganizer,
  renderEventManagement,
);

router.get("/report/event/:id", isLoggedIn, (req, res) =>
  renderNewReport(req, res, "event"),
);
router.get("/report/user/:id", isLoggedIn, (req, res) =>
  renderNewReport(req, res, "user"),
);
router.get("/report/comment/:id", isLoggedIn, (req, res) =>
  renderNewReport(req, res, "comment"),
);

export default router;
