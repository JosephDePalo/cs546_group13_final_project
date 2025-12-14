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
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getEvents).post(protect, newEvent);

router
  .route("/:id")
  .get(getEvent)
  .put(protect, updateEventDetails)
  .delete(protect, deleteEvent);

router
  .route("/register/:id")
  .post(protect, newEventRegistration)
  .delete(protect, cancelEventReg);

router.route("/disable/:id").put(protect, admin, disableEvent);

export default router;
