import express from "express";
import {
  newEvent,
  getEvent,
  getEvents,
  updateEventDetails,
  disableEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import {
  cancelEventReg,
  newEventRegistration,
} from "../controllers/eventreg.controller.js";
import {
  isLoggedIn,
  isAdminOrEventOrganizer,
  isAdmin,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").all(isLoggedIn).get(getEvents).post(newEvent);

router
  .route("/:id")
  .all(isLoggedIn)
  .get(getEvent)
  .put(isAdminOrEventOrganizer, updateEventDetails)
  .delete(isAdminOrEventOrganizer, deleteEvent);

router
  .route("/register/:id")
  .all(isLoggedIn)
  .post(newEventRegistration)
  .delete(cancelEventReg);

router.route("/disable/:id").put(isLoggedIn, isAdmin, disableEvent);

export default router;
