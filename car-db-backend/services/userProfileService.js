import cloudinary from './cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';

// Constants for image validation
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validate image file before uploading
 * @param {Object} file - File object from multer
 * @returns {Object} - Validation result with success flag and message
 */
export const validateImageFile = (file) => {
  try {
    // Check if file exists
    if (!file) {
      return {
        success: false,
        message: 'No file provided',
      };
    }

    // Check file size
    if (file.size < MIN_FILE_SIZE) {
      return {
        success: false,
        message: `File size too small (minimum: 1KB, got: ${(file.size / 1024).toFixed(2)}KB)`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `File size too large (maximum: 10MB, got: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      };
    }

    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return {
        success: false,
        message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        success: false,
        message: `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    // Check if file path exists (for buffer-based uploads)
    if (file.path && !fs.existsSync(file.path)) {
      return {
        success: false,
        message: 'File not found at specified path',
      };
    }

    return {
      success: true,
      message: 'File validation passed',
    };
  } catch (error) {
    return {
      success: false,
      message: `Validation error: ${error.message}`,
    };
  }
};

/**
 * Upload user profile picture to Cloudinary (without storing in repo)
 * @param {string} filePath - Local file path or URL
 * @param {string} userId - User ID for folder organization
 * @returns {Promise} - Upload response with secure_url and public_id
 */
export const uploadUserProfile = async (filePath, userId) => {
  try {
    if (!filePath || !userId) {
      throw new Error('Missing required parameters: filePath and userId');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `cardb/users/${userId}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
        },
      ],
      tags: ['profile-picture'],
      overwrite: true, // Replace previous profile picture
      public_id: `${userId}-profile`,
    });

    // Delete local file after successful upload to Cloudinary
    if (filePath.startsWith('/') || filePath.includes('uploads')) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Local file deleted after Cloudinary upload:', filePath);
        }
      } catch (deleteError) {
        console.warn('Warning: Could not delete local file:', filePath, deleteError.message);
      }
    }

    console.log('User profile picture uploaded successfully to Cloudinary:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Profile picture uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading user profile picture:', error);
    
    // Try to clean up local file on error
    if (filePath && (filePath.startsWith('/') || filePath.includes('uploads'))) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (deleteError) {
        console.warn('Could not delete file on error:', filePath);
      }
    }

    return {
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message,
    };
  }
};

/**
 * Get user profile picture URL
 * @param {string} userId - User ID
 * @returns {string} - Cloudinary URL for the profile picture
 */
export const getUserProfileUrl = (userId) => {
  try {
    if (!userId) {
      throw new Error('Missing required parameter: userId');
    }

    const url = cloudinary.url(`cardb/users/${userId}/${userId}-profile`, {
      secure: true,
      transformation: [
        {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
        },
      ],
    });

    return url;
  } catch (error) {
    console.error('Error generating profile URL:', error);
    return null;
  }
};

/**
 * Delete user profile picture
 * @param {string} userId - User ID
 * @returns {Promise} - Delete response
 */
export const deleteUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Missing required parameter: userId');
    }

    const publicId = `cardb/users/${userId}/${userId}-profile`;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('User profile picture deleted successfully:', result);
    return {
      success: true,
      message: 'Profile picture deleted successfully',
      result,
    };
  } catch (error) {
    console.error('Error deleting user profile picture:', error);
    return {
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message,
    };
  }
};

/**
 * Update user profile picture (replaces existing)
 * @param {string} filePath - Local file path or URL
 * @param {string} userId - User ID
 * @returns {Promise} - Upload response
 */
export const updateUserProfile = async (filePath, userId) => {
  try {
    // Delete existing profile picture first
    await deleteUserProfile(userId);
    
    // Upload new profile picture
    return await uploadUserProfile(filePath, userId);
  } catch (error) {
    console.error('Error updating user profile picture:', error);
    return {
      success: false,
      message: 'Failed to update profile picture',
      error: error.message,
    };
  }
};

export default {
  uploadUserProfile,
  getUserProfileUrl,
  deleteUserProfile,
  updateUserProfile,
  validateImageFile,
};
