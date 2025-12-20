import express from 'express';
import {
  sendOTP,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
} from '../controller/authController.js';
import { verifyToken, verifyTokenOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== REGISTRATION WITH OTP ====================
/**
 * Send OTP for email verification
 * POST /api/auth/register
 */
router.post('/register', sendOTP);

/**
 * Verify OTP and complete registration
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', verifyOTP);

/**
 * Resend OTP for authenticated user
 * POST /api/auth/send-otp
 * Requires: valid JWT token (allows unverified users)
 */
router.post('/send-otp', verifyTokenOnly, sendOTP);

// ==================== LOGIN ====================
/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', login);

// ==================== PASSWORD RESET ====================
/**
 * Request password reset (send email with reset link)
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', forgotPassword);

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
router.post('/reset-password', resetPassword);

// ==================== TOKEN MANAGEMENT ====================
/**
 * Refresh access token
 * POST /api/auth/refresh-token
 * Requires: refresh token in cookies
 */
router.post('/refresh-token', refreshToken);

/**
 * Get user info (via refresh token)
 * GET /api/auth/refresh
 * Requires: refresh token in cookies
 */
router.get('/refresh', refreshToken);

/**
 * Logout user
 * POST /api/auth/logout
 * Requires: valid JWT token
 */
router.post('/logout', verifyToken, logout);

export default router;
