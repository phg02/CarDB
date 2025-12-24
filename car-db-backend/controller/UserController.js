import User from '../model/User.js';
import Payment from '../model/Payment.js';
import { uploadUserProfile, validateImageFile } from '../services/userProfileService.js';
import bcrypt from 'bcryptjs';

// ==================== GET USER PROFILE ====================
/**
 * Get current user profile
 * @route GET /api/users/profile
 * SECURITY: Requires authenticated user
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          createdAt: user.createdAt,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message,
    });
  }
};

// ==================== UPDATE USER PROFILE ====================
/**
 * Update user profile (name, phone)
 * @route PATCH /api/users/profile
 * SECURITY: Requires authenticated user
 * Body: { name, phone }
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone } = req.body;

    // Validate input
    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update (name or phone)',
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long',
        });
      }
    }

    // Validate phone if provided
    if (phone !== undefined) {
      if (phone && !/^\d{10,}$/.test(phone.replace(/[\s-]/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid phone number (at least 10 digits)',
        });
      }
    }

    // Update user
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
        },
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message,
    });
  }
};

// ==================== UPDATE PROFILE IMAGE ====================
/**
 * Update user profile image
 * @route POST /api/users/profile-image
 * SECURITY: Requires authenticated user
 * Multipart form data with 'profileImage' field
 */
export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided. Please upload a profile image.',
      });
    }

    // Validate image file
    const validation = validateImageFile(req.file);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadUserProfile(req.file.path, userId);
    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload profile image',
        error: uploadResult.error,
      });
    }

    // Update user with profile image URL
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: uploadResult.url },
      { new: true }
    ).select('-password -otp -otpExpire -resetPasswordToken -resetPasswordExpire');

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile image',
      error: error.message,
    });
  }
};

// ==================== GET PAYMENT HISTORY ====================
/**
 * Get user's payment history
 * @route GET /api/users/payment-history
 * SECURITY: Requires authenticated user
 * Query: page (default: 1), limit (default: 10)
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const totalPayments = await Payment.countDocuments({
      user: userId,
      isDeleted: false,
    });

    // Get payments with pagination
    const payments = await Payment.find({
      user: userId,
      isDeleted: false,
    })
      .populate({
        path: 'order',
        select: 'orderNumber orderStatus orderDate',
      })
      .populate({
        path: 'car',
        select: 'heading price images',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPayments / limit);

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments: payments.map((payment) => ({
          id: payment._id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
          order: payment.order,
          car: payment.car,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalPayments,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message,
    });
  }
};

// ==================== CHANGE PASSWORD ====================
/**
 * Change user password
 * @route POST /api/users/change-password
 * SECURITY: Requires authenticated user
 * Body: { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password, new password, and confirm password',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    // Check if new password is same as current
    if (newPassword === currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as current password',
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

// ==================== DELETE ACCOUNT ====================
/**
 * Delete user account (soft delete)
 * @route DELETE /api/users/account
 * SECURITY: Requires authenticated user
 * Body: { password } - confirm with password
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm deletion',
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect',
      });
    }

    // Soft delete user
    user.isDeleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
};
