import Comment from '../models/comments.model.js';

// Check if the user has permission to comment.
const checkCommentOwnership = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comments do not exist'
      });
    }

    // Administrators or comment authors can perform this action.
    const isOwner = comment.user_id.toString() === userId.toString();
    
    if (!isOwner && !req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'No permission'
      });
    }

    req.comment = comment;
    next();
  } catch (error) {
    console.error('Comment auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission verification failed.'
    });
  }
};

// Check if comments are disabled
const checkCommentAvailability = async (req, res, next) => {
  try {
    const { comment_id } = req.params;

    const comment = await Comment.findById(comment_id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment does not exist'
      });
    }

    if (comment.disabled && !req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Comment disabled'
      });
    }

    req.comment = comment;
    next();
  } catch (error) {
    console.error('Comment availability middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Comment status check failed'
    });
  }
};

export {
  checkCommentOwnership,
  checkCommentAvailability

};
