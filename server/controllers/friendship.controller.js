import Friendship from '../models/friendship.model.js';

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friend_id } = req.body;

    // Create a friend request
    const friendship = await Friendship.create({
      user_id: userId,
      friend_id,
      status: 'pending'
    });

    // Returning user information
    const populatedFriendship = await Friendship.findById(friendship._id)
      .populate('user_id', 'username email profile_picture_url')
      .populate('friend_id', 'username email profile_picture_url');

    res.status(201).json({

      message: 'Friend request sent successfully',
      data: populatedFriendship
    });
  } catch (error) {
    // duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({

        message: 'A friendship already exists'
      });
    }

    console.error('Send friend request error:', error);
    res.status(500).json({

      message: 'Friend request failed to send',
      error: error.message
    });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const friendship = req.friendship;

    await friendship.accept();

    // Returning user information
    const updatedFriendship = await Friendship.findById(friendship._id)
      .populate('user_id', 'username email profile_picture_url')
      .populate('friend_id', 'username email profile_picture_url');

    res.json({

      message: 'Friend request accepted',
      data: updatedFriendship
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({

      message: 'Friend request failed to be accepted',
      error: error.message
    });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const friendship = req.friendship;

    await friendship.reject();

    res.json({

      message: 'Friend request rejected',
      data: friendship
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({

      message: 'Failed to reject friend request',
      error: error.message
    });
  }
};

// Get the user's friend list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = {
      $or: [
        { user_id: userId },
        { friend_id: userId }
      ]
    };

    // If a state is specified, add a state filter.
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      query.status = status;
    } else {
      // By default, only accepted friends are returned.
      query.status = 'accepted';
    }

    const skip = (page - 1) * limit;

    const friendships = await Friendship.find(query)
      .populate('user_id', 'username email profile_picture_url')
      .populate('friend_id', 'username email profile_picture_url')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Friendship.countDocuments(query);

    // Formatted return data
    const formattedFriendships = friendships.map(friendship => {
      const isRequester = friendship.user_id._id.toString() === userId.toString();
      return {
        _id: friendship._id,
        status: friendship.status,
        friend: isRequester ? friendship.friend_id : friendship.user_id,
        is_requester: isRequester,
        created_at: friendship.createdAt,
        updated_at: friendship.updatedAt
      };
    });

    res.json({

      data: formattedFriendships,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({

      message: 'Failed to retrieve friend list',
      error: error.message
    });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const requests = await Friendship.find({
      friend_id: userId,
      status: 'pending'
    })
      .populate('user_id', 'username email profile_picture_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Friendship.countDocuments({
      friend_id: userId,
      status: 'pending'
    });

    res.json({

      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({

      message: 'Friend request failed',
      error: error.message
    });
  }
};

// Get sent friend requests
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const requests = await Friendship.find({
      user_id: userId,
      status: 'pending'
    })
      .populate('friend_id', 'username email profile_picture_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Friendship.countDocuments({
      user_id: userId,
      status: 'pending'
    });

    res.json({

      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({

      message: 'Failed to retrieve sent request',
      error: error.message
    });
  }
};

// Check the friendship status between two users
export const checkFriendshipStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { target_user_id } = req.params;

    const friendship = await Friendship.exists(userId, target_user_id);

    if (!friendship) {
      return res.json({

        data: {
          is_friend: false,
          status: 'none',
          can_send_request: true
        }
      });
    }

    res.json({

      data: {
        is_friend: friendship.status === 'accepted',
        status: friendship.status,
        friendship_id: friendship._id,
        is_requester: friendship.user_id.toString() === userId.toString(),
        created_at: friendship.createdAt,
        updated_at: friendship.updatedAt,
        can_send_request: false
      }
    });
  } catch (error) {
    console.error('Check friendship status error:', error);
    res.status(500).json({

      message: 'Friendship status check failed',
      error: error.message
    });
  }
};

// Delete friend relationship
export const removeFriend = async (req, res) => {
  try {
    const { friendship_id } = req.params;

    await Friendship.findByIdAndDelete(friendship_id);

    res.json({

      message: 'Friend relationship deleted'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({

      message: 'Friend deletion failed',
      error: error.message
    });
  }
};

// Cancel friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const { friendship_id } = req.params;

    await Friendship.findByIdAndDelete(friendship_id);

    res.json({

      message: 'Friend request canceled'
    });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({

      message: 'Cancel friend request failed',
      error: error.message
    });
  }

};
