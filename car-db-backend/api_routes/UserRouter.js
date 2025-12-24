import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  getPaymentHistory,
  changePassword,
  deleteAccount,
} from '../controller/UserController.js';
import { verifyToken, verifyTokenOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads/users');
// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});

// ==================== USER PROFILE ====================
/**
 * Get current user profile
 * GET /api/users/profile
 * Requires: Valid JWT token
 */
router.get('/profile', verifyToken, getUserProfile);

/**
 * Update user profile (name, phone)
 * PATCH /api/users/profile
 * Requires: Valid JWT token
 * Body: { name?, phone? }
 */
router.patch('/profile', verifyToken, updateUserProfile);

// ==================== PROFILE IMAGE ====================
/**
 * Update user profile image
 * POST /api/users/profile-image
 * Requires: Valid JWT token
 * Multipart form data with 'profileImage' file
 */
router.post('/profile-image', verifyToken, upload.single('profileImage'), updateProfileImage);

// ==================== PAYMENT HISTORY ====================
/**
 * Get user's payment history
 * GET /api/users/payment-history
 * Requires: Valid JWT token
 * Query: page (default: 1), limit (default: 10)
 */
router.get('/payment-history', verifyToken, getPaymentHistory);

// ==================== PASSWORD & ACCOUNT ====================
/**
 * Change user password
 * POST /api/users/change-password
 * Requires: Valid JWT token
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.post('/change-password', verifyToken, changePassword);

/**
 * Delete user account
 * DELETE /api/users/account
 * Requires: Valid JWT token
 * Body: { password } - confirm deletion with password
 */
router.delete('/account', verifyToken, deleteAccount);

export default router;
