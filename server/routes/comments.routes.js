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

import {
  checkCommentOwnership,
  checkCommentAvailability,
} from "../middlewares/CommentsAuth.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

//router.use(auth); Authentication has been added to the write, delete, and report functions.

// Create comment
router.post("/", isLoggedIn, createComment);

// Get comments list
router.get("/events/:event_id/comments", getEventComments);
router.get("/comments/:comment_id", getCommentById);
router.get("/comments/:comment_id/replies", getCommentReplies);
router.get("/users/:user_id/comments", getUserComments);

// Delete comment
router.delete("/:comment_id", isLoggedIn, checkCommentOwnership, deleteComment);

// report comment
router.post("/comments/:comment_id/report", isLoggedIn, reportComment);

export default router;
