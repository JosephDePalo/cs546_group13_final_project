import express from 'express';
import {
  createComment,
  getEventComments,
  getCommentById,
  getCommentReplies,
  deleteComment,
  reportComment,
  getUserComments
} from '../controllers/commentController.js';

import auth from '../middleware/auth.js';
import { checkCommentOwnership, checkCommentAvailability } from '../middleware/commentAuth.js';

const router = express.Router();

router.use(auth);

// Create comment
router.post('/comments', createComment);

// Get comments list
router.get('/events/:event_id/comments', getEventComments);
router.get('/comments/:comment_id', checkCommentAvailability, getCommentById);
router.get('/comments/:comment_id/replies', checkCommentAvailability, getCommentReplies);
router.get('/users/:user_id/comments', getUserComments);

// Delete comment
router.delete('/comments/:comment_id', checkCommentOwnership, deleteComment);

// report comment
router.post('/comments/:comment_id/report', reportComment);

export default router;