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

// Get all reports | create new report

router
    .route("/reports")
    .get(getAllReports)
    .post(protect, newReport);

// Get report by reportId | update report | delete report

router
    .route("/reports/:id")
    .get(getReport)
    .put(protect, admin, updateReport)
    .delete(protect, admin, deleteReport);

// Get all reports for specified eventId

router
    .route("/reports/:eventid")
    .get(getReport);

// Resolve a report

router
    .route("/reports/resolve/:id")
    .put(protect, admin, resolveReport);

export default router