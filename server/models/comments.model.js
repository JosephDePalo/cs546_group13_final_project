import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'UserId required']
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'EventId required']
  },
  content: {
    type: String,
    required: [true, 'Comment content cannot be empty.'],
    trim: true,
    maxlength: [1000, 'Comments cannot exceed 1000 characters.']
  },
  parent_comment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  reply_depth: {
    type: Number,
    default: 0,
    min: 0
  },
  report_count: {
    type: Number,
    default: 0,
    min: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabled_reason: {
    type: String,
    default: null
  },
  disabled_at: {
    type: Date,
    default: null
  },
  disabled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
});

// Index
commentSchema.index({ event_id: 1, created_at: -1 });
commentSchema.index({ user_id: 1 });
commentSchema.index({ parent_comment_id: 1 });
commentSchema.index({ disabled: 1 });

// Get the event's comment list
commentSchema.statics.getEventComments = function(eventId, page = 1, limit = 20) {
  return this.find({
    event_id: eventId,
    parent_comment_id: null, // Get only top-level comments
    disabled: false
  })
    .populate('user_id', 'username first_name last_name profile_picture_url')
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Get replies to comments
commentSchema.statics.getCommentReplies = function(commentId, page = 1, limit = 20) {
  return this.find({
    parent_comment_id: commentId,
    disabled: false
  })
    .populate('user_id', 'username first_name last_name profile_picture_url')
    .sort({ created_at: 1 }) // Replies are arranged in ascending order of time.
    .skip((page - 1) * limit)
    .limit(limit);
};

// Get user comments
commentSchema.statics.getUserComments = function(userId, page = 1, limit = 20) {
  return this.find({
    user_id: userId,
    disabled: false
  })
    .populate('event_id', 'title')
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Disable Comments
commentSchema.methods.disable = function(adminId, reason) {
  this.disabled = true;
  this.disabled_reason = reason;
  this.disabled_at = new Date();
  this.disabled_by = adminId;
  return this.save();
};

// Enable comments
commentSchema.methods.enable = function() {
  this.disabled = false;
  this.disabled_reason = null;
  this.disabled_at = null;
  this.disabled_by = null;
  return this.save();
};

// Increase the number of reports
commentSchema.methods.incrementReportCount = function() {
  this.report_count += 1;
  return this.save();
};

export default mongoose.model('Comment', commentSchema);