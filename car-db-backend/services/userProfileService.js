import cloudinary from './cloudinaryConfig.js';

/**
 * Upload user profile picture
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

    console.log('User profile picture uploaded successfully:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Profile picture uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading user profile picture:', error);
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
};
