import express from 'express';
import {
  createComment,
  getCommentsByNews,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentsByUser,
} from '../controller/CommentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
/**
 * Get all comments for a news post
 * @route GET /api/comments/news/:newsId
 */
router.get('/news/:newsId', getCommentsByNews);

/**
 * Get a single comment by ID
 * @route GET /api/comments/:commentId
 */
router.get('/:commentId', getCommentById);

/**
 * Get all comments from a user
 * @route GET /api/comments/user/:userId
 */
router.get('/user/:userId', getCommentsByUser);

// ==================== PRIVATE ROUTES (Require Authentication) ====================
/**
 * Create a new comment on a news post
 * @route POST /api/comments/create/:newsId
 */
router.post('/create/:newsId', verifyToken, createComment);

/**
 * Update a comment
 * @route PATCH /api/comments/:commentId
 */
router.patch('/:commentId', verifyToken, updateComment);

/**
 * Delete a comment
 * @route DELETE /api/comments/:commentId
 */
router.delete('/:commentId', verifyToken, deleteComment);

export default router;
