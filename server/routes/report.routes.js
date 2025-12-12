import express from "express";
import {
    newReport,
    getAllReports,
    getReport,
    updateReport,
    deleteReport,
    resolveReport
} from "../controllers/report.controller.js"

import {protect, admin} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create new report

router
    .route("/reports")
    .post(protect, newReport);

// Get report by reportId | update report | delete report (admin priviledges only)

router
    .route("/reports/:id")
    .get(protect, admin, getReport)
    .put(protect, admin, updateReport)
    .delete(protect, admin, deleteReport);

// Get all reports (admin priviledges only)

router
    .route("/reports/admin")
    .get(protect, admin, getAllReports);

// Get all reports for specified eventId (admin priviledges only)

router
    .route("/reports/admin/:eventid")
    .get(protect, admin, getReport);

// Resolve a report(admin priviledges only)

router
    .route("/reports/resolve/:id")
    .put(protect, admin, resolveReport);


export default router
