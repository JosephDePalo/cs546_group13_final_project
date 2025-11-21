import express from "express";
import {
  newEvent,
  getEvent,
  getEvents,
  updateEventDetails,
  disableEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getEvents).post(protect, newEvent);

router
  .route("/:id")
  .get(getEvent)
  .put(protect, updateEventDetails)
  .delete(protect, deleteEvent);

router.route("/disable/:id").put(protect, admin, disableEvent);

export default router;
