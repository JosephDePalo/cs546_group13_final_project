import Comment from "../models/comments.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";

// Create a comment
export const createComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { event_id, content, parent_comment_id } = req.body;

    // Validate necessary fields
    if (!event_id || !content) {
      return res.status(400).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `EventId and content required`,
      });
    }

    // Verify if the event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event does not exist`,
      });
    }

    let replyDepth = 0;
    let parentComment = null;

    // If replying to a comment, verify the parent comment.
    if (parent_comment_id) {
      parentComment = await Comment.findById(parent_comment_id);
      if (!parentComment) {
        return res.status(404).render("error", {
          page_title: "Register | Volunteer Forum",
          logged_in: Boolean(req.user),
          user_id: req.user ? req.user._id : null,
          message: `Parent comment does not exist`,
        });
      }

      if (parentComment.disabled) {
        return res.status(400).render("error", {
          page_title: "Register | Volunteer Forum",
          logged_in: Boolean(req.user),
          user_id: req.user ? req.user._id : null,
          message: `Unable to reply to disabled comments`,
        });
      }
      if (parentComment.parent_comment_id) {
        return res.status(400).render("error", {
          page_title: "Register | Volunteer Forum",
          logged_in: Boolean(req.user),
          user_id: req.user ? req.user._id : null,
          message: "Replies to replies are not allowed.",
        });
      }
      // Make sure the replies are to comments from the same event.
      if (parentComment.event_id.toString() !== event_id) {
        return res.status(400).render("error", {
          page_title: "Register | Volunteer Forum",
          logged_in: Boolean(req.user),
          user_id: req.user ? req.user._id : null,
          message: `You can only reply to comments from the same event.`,
        });
      }

      replyDepth = parentComment.reply_depth + 1;
    }

    // Create a comment
    const comment = await Comment.create({
      user_id: userId,
      event_id,
      content,
      parent_comment_id: parent_comment_id || null,
      reply_depth: replyDepth,
    });

    // Returning user information
    const populatedComment = await Comment.findById(comment._id)
      .populate("user_id", "username first_name last_name profile_picture_url")
      .populate("parent_comment_id", "content user_id");

    // Update user comments count
    await User.findByIdAndUpdate(userId, {
      $inc: { "account_stats.comments_count": 1 },
    });

    res.status(201).json({
      message: parent_comment_id ? "Reply successful" : "Comment successful",
      data: populatedComment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      message: "Comment creation failed",
      error: error.message,
    });
  }
};

// Get the list of event comments
export const getEventComments = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { page = 1, limit = 20, include_replies = true } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Verify if the event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event does not exist`,
      });
    }

    // Get top comments
    const comments = await Comment.getEventComments(
      event_id,
      pageNum,
      limitNum,
    );
    const totalComments = await Comment.countDocuments({
      event_id,
      parent_comment_id: null,
      disabled: false,
    });

    let commentsWithReplies = comments;

    // If replies are included, retrieve the replies for each comment.
    if (include_replies === "true") {
      commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await Comment.getCommentReplies(comment._id, 1, 10);
          return {
            ...comment.toObject(),
            replies: replies,
            replies_count: replies.length,
          };
        }),
      );
    }

    res.json({
      data: commentsWithReplies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalComments,
        totalPages: Math.ceil(totalComments / limitNum),
      },
    });
  } catch (error) {
    console.error("Get event comments error:", error);
    res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Failed to retrieve comment list`,
    });
  }
};

// Get comment details
export const getCommentById = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id)
      .populate("user_id", "username first_name last_name profile_picture_url")
      .populate("event_id", "title")
      .populate("parent_comment_id", "content user_id");

    if (!comment) {
      return res.status(404).json({
        message: "Comment does not exist",
      });
    }

    if (comment.disabled && !req.user.is_admin) {
      return res.status(403).json({
        message: "Comment has been disabled.",
      });
    }

    // Get replies to comments
    const replies = await Comment.getCommentReplies(comment_id, 1, 50);

    res.json({
      data: {
        ...comment.toObject(),
        replies: replies,
        replies_count: replies.length,
      },
    });
  } catch (error) {
    console.error("Get comment by id error:", error);
    res.status(500).json({
      message: "Failed to retrieve comment details",
      error: error.message,
    });
  }
};

// Get replies to comments
export const getCommentReplies = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Verify if the parent comment exists
    const parentComment = await Comment.findById(comment_id);
    if (!parentComment) {
      return res.status(404).json({
        message: "Comment does not exist",
      });
    }

    const replies = await Comment.getCommentReplies(
      comment_id,
      pageNum,
      limitNum,
    );
    const totalReplies = await Comment.countDocuments({
      parent_comment_id: comment_id,
      disabled: false,
    });

    res.json({
      data: replies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalReplies,
        totalPages: Math.ceil(totalReplies / limitNum),
      },
    });
  } catch (error) {
    console.error("Get comment replies error:", error);
    res.status(500).json({
      message: "Failed to retrieve reply list",
      error: error.message,
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { comment_id } = req.params;

    const comment = await Comment.findOne({
      _id: comment_id,
      user_id: userId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comments do not exist",
      });
    }

    // If you are an administrator, you can force deletion.
    if (!req.user.is_admin) {
      // Regular users can only delete their own comments and cannot reply.
      const replyCount = await Comment.countDocuments({
        parent_comment_id: comment_id,
        disabled: false,
      });

      if (replyCount > 0) {
        return res.status(400).json({
          message:
            "This comment has already been replied to and cannot be deleted.",
        });
      }
    }

    await Comment.findByIdAndDelete(comment_id);

    // Update user comment count
    await User.findByIdAndUpdate(userId, {
      $inc: { "account_stats.comments_count": -1 },
    });

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      message: "Comment deletion failed",
      error: error.message,
    });
  }
};

// Report comments
export const reportComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment does not exist",
      });
    }

    if (comment.disabled) {
      return res.status(400).json({
        message: "Comments are disabled; reporting is not possible.",
      });
    }

    // Increase the number of reports
    await comment.incrementReportCount();

    res.json({
      message: "Report successful",
      data: {
        comment_id: comment._id,
        report_count: comment.report_count,
      },
    });
  } catch (error) {
    console.error("Report comment error:", error);
    res.status(500).json({
      message: "Failed to report comment",
      error: error.message,
    });
  }
};

// Get user comment history
export const getUserComments = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const comments = await Comment.getUserComments(user_id, pageNum, limitNum);
    const totalComments = await Comment.countDocuments({
      user_id,
      disabled: false,
    });

    res.json({
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalComments,
        totalPages: Math.ceil(totalComments / limitNum),
      },
    });
  } catch (error) {
    console.error("Get user comments error:", error);
    res.status(500).json({
      message: "Failed to retrieve user comments",
      error: error.message,
    });
  }
};
