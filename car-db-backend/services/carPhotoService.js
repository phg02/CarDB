import cloudinary from './cloudinaryConfig.js';
import fs from 'fs';

/**
 * Upload car photos to Cloudinary
 * @param {string} filePath - Local file path or URL
 * @param {string} carId - Car post ID for folder organization
 * @returns {Promise} - Upload response with secure_url and public_id
 */
export const uploadCarPhoto = async (filePath, carId) => {
  try {
    if (!filePath || !carId) {
      throw new Error('Missing required parameters: filePath and carId');
    }

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

    console.log('Car photo uploaded successfully:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Car photo uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading car photo:', error);
    return {
      success: false,
      message: 'Failed to upload car photo',
      error: error.message,
    };
  }
};

/**
 * Upload multiple car photos
 * @param {Array} filePaths - Array of local file paths or URLs
 * @param {string} carId - Car post ID for folder organization
 * @returns {Promise} - Array of upload responses
 */
export const uploadMultipleCarPhotos = async (filePaths, carId) => {
  try {
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      throw new Error('Missing required parameters: filePaths must be a non-empty array');
    }

    if (!carId) {
      throw new Error('Missing required parameter: carId');
    }

    const uploadPromises = filePaths.map((filePath) =>
      uploadCarPhoto(filePath, carId)
    );

    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    console.log(
      `Uploaded ${successfulUploads.length} out of ${results.length} car photos`
    );

    return {
      success: failedUploads.length === 0,
      totalUploaded: successfulUploads.length,
      totalFailed: failedUploads.length,
      uploadedUrls: successfulUploads.map((r) => r.url),
      results: successfulUploads,
      failedResults: failedUploads,
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
