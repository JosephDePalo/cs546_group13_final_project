import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
  getSentRequests,
  checkFriendshipStatus,
  removeFriend,
  cancelFriendRequest,
} from "../controllers/friendship.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import {
  checkFriendshipOwnership,
  checkRequestReceiver,
  checkRequestSender,
  checkCanSendRequest,
} from "../middlewares/friendshipAuth.middleware.js";

const router = express.Router();

router.use(protect);

// Friend request
router.post("/requests", checkCanSendRequest, sendFriendRequest);
router.patch(
  "/requests/:friendship_id/accept",
  checkRequestReceiver,
  acceptFriendRequest,
);
router.patch(
  "/requests/:friendship_id/reject",
  checkRequestReceiver,
  rejectFriendRequest,
);
router.delete(
  "/requests/:friendship_id/cancel",
  checkRequestSender,
  cancelFriendRequest,
);

// Query function
router.get("/", getFriends);
router.get("/requests/pending", getPendingRequests);
router.get("/requests/sent", getSentRequests);
router.get("/status/:target_user_id", checkFriendshipStatus);

// Delete function
router.delete("/:friendship_id", checkFriendshipOwnership, removeFriend);

export default router;
