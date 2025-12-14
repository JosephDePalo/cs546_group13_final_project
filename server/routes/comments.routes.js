import express from "express";
import {
  createComment,
  getEventComments,
  getCommentById,
  getCommentReplies,
  deleteComment,
  reportComment,
  getUserComments,
} from "../controllers/comments.controller.js";

import auth from "../middleware/auth.js";
import {
  checkCommentOwnership,
  checkCommentAvailability,
} from "../middleware/commentAuth.js";

const router = express.Router();

//router.use(auth); Authentication has been added to the write, delete, and report functions.

// Create comment
router.post("/comments", auth, createComment);

// Get comments list
router.get("/events/:event_id/comments", getEventComments);
router.get("/comments/:comment_id", getCommentById);
router.get("/comments/:comment_id/replies", getCommentReplies);
router.get("/users/:user_id/comments", getUserComments);

// Delete comment
router.delete(
  "/comments/:comment_id",
  auth,
  checkCommentOwnership,
  deleteComment,
);

// report comment
router.post("/comments/:comment_id/report", auth, reportComment);

export default router;
