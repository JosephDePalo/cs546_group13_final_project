import express from "express";
import {
  getReport,
  updateReport,
  deleteReport,
  newReport,
} from "../controllers/report.controller.js";

import { isLoggedIn, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create new report

// /api/v1/reports

router.route("/").post(isLoggedIn, newReport);

// Get report by reportId | update report | delete report (admin priviledges only)

router
  .route("/:id")
  .get(isLoggedIn, isAdmin, getReport)
  .put(isLoggedIn, isAdmin, updateReport)
  .delete(isLoggedIn, isAdmin, deleteReport);

// Get all reports (admin priviledges only)

// router.route("/reports/admin").get(protect, admin, getAllReports);

// Get all reports for specified eventId (admin priviledges only)

// router.route("/reports/admin/:eventid").get(protect, admin, getReport);

// Resolve a report(admin priviledges only)

// router.route("/reports/resolve/:id").put(protect, admin, resolveReport);

export default router;
