import express from "express";
import {
    newEventRegistration,
    getEventRegistration,
    getAllEventRegistrations,
    updateEventRegistration,
    deleteEventReg,
    cancelEventReg
} from "../controllers/eventreg.controller.js";

import {protect, admin} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all Event Registrations | Create new Event Registration

router
    .route("/events/register")
    .get(getAllEventRegistrations)
    .post(protect, newEventRegistration);

// Get Event Registration by id | update Event Registration | Delete Event Registration

router
    .route("events/register/:id")
    .get(getEventRegistration)
    .put(protect, updateEventRegistration)
    .delete(protect, deleteEventReg);

// Cancel Event Registration

router
    .route("events/register/cancel/:id")
    .put(protect, admin, cancelEventReg);


export default router