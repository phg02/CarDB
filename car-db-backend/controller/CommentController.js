import Comment from "../model/Comment.js";
import News from "../model/News.js";

// ==================== CREATE COMMENT ====================
/**
 * Create a new comment on a news post
 * @route POST /api/comments/create/:newsId
 * @access Private
 */
export const createComment = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot be empty",
      });
    }

    if (content.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Comment must be at least 2 characters long",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 2000 characters",
      });
    }

    // Check if news exists
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News post not found",
      });
    }

    // Don't allow comments on deleted news
    if (news.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Cannot comment on deleted news post",
      });
    }

    // Create new comment
    const newComment = new Comment({
      news: newsId,
      user: userId,
      content: content.trim(),
    });

    await newComment.save();
    await newComment.populate("user", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: {
        comment: newComment,
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

// ==================== GET COMMENTS FOR NEWS ====================
/**
 * Get all comments for a specific news post
 * @route GET /api/comments/news/:newsId
 * @access Public
 */
export const getCommentsByNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if news exists
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News post not found",
      });
    }

    // Get comments (exclude deleted ones)
    const comments = await Comment.find({
      news: newsId,
      isDeleted: false,
    })
      .populate("user", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalComments = await Comment.countDocuments({
      news: newsId,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
};

// ==================== GET SINGLE COMMENT ====================
/**
 * Get a specific comment by ID
 * @route GET /api/comments/:commentId
 * @access Public
 */
export const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate("user", "name email profileImage")
      .populate("news", "title");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment has been deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully",
      data: {
        comment,
      },
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comment",
      error: error.message,
    });
  }
};

// ==================== UPDATE COMMENT ====================
/**
 * Update a comment (only by comment author)
 * @route PATCH /api/comments/:commentId
 * @access Private
 */
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Cannot update a deleted comment",
      });
    }

    // Check if user is the comment author
    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    // Validate new content
    if (content !== undefined) {
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment content cannot be empty",
        });
      }

      if (content.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Comment must be at least 2 characters long",
        });
      }

      if (content.trim().length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot exceed 2000 characters",
        });
      }

      comment.content = content.trim();
    }

    await comment.save();
    await comment.populate("user", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: {
        comment,
      },
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// ==================== DELETE COMMENT ====================
/**
 * Delete a comment (soft delete - only by comment author or admin)
 * @route DELETE /api/comments/:commentId
 * @access Private
 */
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const isAdmin = req.user.isAdmin;

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment is already deleted",
      });
    }

    // Check if user is the comment author or admin
    if (comment.user.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: {
        commentId,
      },
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

// ==================== GET USER'S COMMENTS ====================
/**
 * Get all comments from a specific user
 * @route GET /api/comments/user/:userId
 * @access Public
 */
export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({
      user: userId,
      isDeleted: false,
    })
      .populate("user", "name email profileImage")
      .populate("news", "title")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalComments = await Comment.countDocuments({
      user: userId,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      message: "User comments retrieved successfully",
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComments / parseInt(limit)),
          totalComments,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user comments",
      error: error.message,
    });
  }
};
