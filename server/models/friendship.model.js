import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "UserId required"],
    },
    friend_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "FriendId required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "none"],
        message: "Status must be pending, accepted, rejected or none",
      },
      default: "none",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure that there can only be one friendship relationship between the same pair of users.
friendshipSchema.index({ user_id: 1, friend_id: 1 }, { unique: true });

// Check if a friendship relationship exists between two users.
friendshipSchema.statics.exists = function (userId, friendId) {
  return this.findOne({
    $or: [
      { user_id: userId, friend_id: friendId },
      { user_id: friendId, friend_id: userId },
    ],
  });
};

// Get all of a user's friends
friendshipSchema.statics.getFriends = function (userId, status = "accepted") {
  return this.find({
    $or: [
      { user_id: userId, status: status },
      { friend_id: userId, status: status },
    ],
  })
    .populate("user_id", "username email profile_picture_url")
    .populate("friend_id", "username email profile_picture_url");
};

// Get user's friend requests
friendshipSchema.statics.getFriendRequests = function (userId) {
  return this.find({
    friend_id: userId,
    status: "pending",
  }).populate("user_id", "username email profile_picture_url");
};

// Get friend requests sent by users
friendshipSchema.statics.getSentRequests = function (userId) {
  return this.find({
    user_id: userId,
    status: "pending",
  }).populate("friend_id", "username email profile_picture_url");
};

// Accept friend request
friendshipSchema.methods.accept = function () {
  this.status = "accepted";
  return this.save();
};

// Reject friend request
friendshipSchema.methods.reject = function () {
  this.status = "rejected";
  return this.save();
};

export default mongoose.model("Friendship", friendshipSchema);
