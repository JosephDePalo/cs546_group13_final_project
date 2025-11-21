import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  checkFriendshipStatus,
  removeFriend,
  cancelFriendRequest
} from '../controllers/friendshipController.js';

import auth from '../middleware/auth.js';
import {
  checkFriendshipOwnership,
  checkRequestReceiver,
  checkRequestSender,
  checkCanSendRequest
} from '../middleware/friendshipAuth.js';

const router = express.Router();w

router.use(auth);

// Friend request 
router.post('/friends/requests', checkCanSendRequest, sendFriendRequest);
router.patch('/friends/requests/:friendship_id/accept', checkRequestReceiver, acceptFriendRequest);
router.patch('/friends/requests/:friendship_id/reject', checkRequestReceiver, rejectFriendRequest);
router.delete('/friends/requests/:friendship_id/cancel', checkRequestSender, cancelFriendRequest);

// Query function
router.get('/friends', getFriends);
router.get('/friends/requests/pending', getPendingRequests);
router.get('/friends/requests/sent', getSentRequests);
router.get('/friends/status/:target_user_id', checkFriendshipStatus);

// Delete function
router.delete('/friends/:friendship_id', checkFriendshipOwnership, removeFriend);

export default router;