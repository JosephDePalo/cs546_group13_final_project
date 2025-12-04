import Friendship from '../models/friendship.model.js';
import User from '../models/user.model.js';

// Check if the user has permission to operate this friendship relationship.
const checkFriendshipOwnership = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendship_id } = req.params;

    if (!friendship_id) {
      return res.status(400).json({
        success: false,
        message: 'FriendshipId required'
      });
    }

    const friendship = await Friendship.findById(friendship_id);

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'The friendship does not exist'
      });
    }

    // Check if the user is a participant in the friendship relationship.
    const isParticipant = 
      friendship.user_id.toString() === userId.toString() || 
      friendship.friend_id.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Do not have permission to operate this friendship relationship.'
      });
    }

    req.friendship = friendship;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid friendshipId format'
      });
    }

    console.error('Friendship auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission verification failed.'
    });
  }
};

// Check if the user has permission to accept/reject friend requests.
const checkRequestReceiver = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendship_id } = req.params;

    const friendship = await Friendship.findOne({
      _id: friendship_id,
      friend_id: userId,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'No pending friend requests found or you do not have permission to process them.'
      });
    }

    req.friendship = friendship;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid friendshipId format'
      });
    }

    console.error('Request receiver middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission verification failed.'
    });
  }
};

// Check if the user has permission to cancel the request they sent.
const checkRequestSender = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendship_id } = req.params;

    const friendship = await Friendship.findOne({
      _id: friendship_id,
      user_id: userId,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'No friend requests to be cancelled found or you do not have permission to do so.'
      });
    }

    req.friendship = friendship;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid friendshipId format'
      });
    }

    console.error('Request sender middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission verification failed.'
    });
  }
};

// Check if you can send a friend request.
const checkCanSendRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friend_id } = req.body;

    if (!friend_id) {
      return res.status(400).json({
        success: false,
        message: 'FriendId required'
      });
    }

    // Check if Myself have been added as a friend
    if (userId.toString() === friend_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add yourself as a friend'
      });
    }

    // Check if the target user exists
    const targetUser = await User.findById(friend_id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user does not exist'
      });
    }

    // Check if a friendship relationship already exists.
    const existingFriendship = await Friendship.exists(userId, friend_id);
    if (existingFriendship) {
      return res.status(400).json({
        success: false,
        message: 'A friendship already exists',
        data: existingFriendship
      });
    }

    req.targetUser = targetUser;
    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    console.error('Can send request middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Request verification failed'
    });
  }
};

export {
  checkFriendshipOwnership,
  checkRequestReceiver,
  checkRequestSender,
  checkCanSendRequest
};