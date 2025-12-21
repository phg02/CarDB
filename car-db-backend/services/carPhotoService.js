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
 * Upload car photos to Cloudinary (without storing in repo)
 * @param {string} filePath - Local file path or URL
 * @param {string} carId - Car post ID for folder organization
 * @returns {Promise} - Upload response with secure_url and public_id
 */
export const uploadCarPhoto = async (filePath, carId) => {
  let tempFilePath = null;
  try {
    if (!filePath || !carId) {
      throw new Error('Missing required parameters: filePath and carId');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `cardb/cars/${carId}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
        },
      ],
      tags: ['car-photo'],
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

    console.log('Car photo uploaded successfully to Cloudinary:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Car photo uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading car photo:', error);
    
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
      message: 'Failed to upload car photo',
      error: error.message,
    };
  }
};

/**
 * Upload multiple car photos with validation
 * @param {Array} files - Array of file objects from multer
 * @param {string} carId - Car post ID for folder organization
 * @returns {Promise} - Array of upload responses
 */
export const uploadMultipleCarPhotos = async (files, carId) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Missing required parameters: files must be a non-empty array');
    }

    if (!carId) {
      throw new Error('Missing required parameter: carId');
    }

    // Validate all files before uploading
    const validatedFiles = [];
    const validationErrors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (validation.success) {
        validatedFiles.push(file);
      } else {
        validationErrors.push({
          filename: file.originalname,
          error: validation.message,
        });
      }
    }

    // If no valid files, return error
    if (validatedFiles.length === 0) {
      throw new Error(
        `All files failed validation: ${validationErrors.map((e) => e.error).join('; ')}`
      );
    }

    // Upload all validated files
    const uploadPromises = validatedFiles.map((file) =>
      uploadCarPhoto(file.path, carId)
    );

    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    console.log(
      `Uploaded ${successfulUploads.length} out of ${validatedFiles.length} car photos`
    );

    return {
      success: failedUploads.length === 0 && successfulUploads.length > 0,
      totalUploaded: successfulUploads.length,
      totalFailed: failedUploads.length,
      totalValidationErrors: validationErrors.length,
      uploadedUrls: successfulUploads.map((r) => r.url),
      results: successfulUploads,
      failedResults: failedUploads,
      validationErrors: validationErrors,
    };
  } catch (error) {
    console.error('Error uploading multiple car photos:', error);
    return {
      success: false,
      message: 'Failed to upload car photos',
      error: error.message,
    };
  }
};

/**
 * Delete car photo from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise} - Delete response
 */
export const deleteCarPhoto = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Missing required parameter: publicId');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Car photo deleted successfully:', result);
    return {
      success: true,
      message: 'Car photo deleted successfully',
      result,
    };
  } catch (error) {
    console.error('Error deleting car photo:', error);
    return {
      success: false,
      message: 'Failed to delete car photo',
      error: error.message,
    };
  }
};

export default {
  uploadCarPhoto,
  uploadMultipleCarPhotos,
  deleteCarPhoto,
};
