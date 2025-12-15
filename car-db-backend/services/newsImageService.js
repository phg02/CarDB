import cloudinary from './cloudinaryConfig.js';

/**
 * Upload news thumbnail/cover image
 * @param {string} filePath - Local file path or URL
 * @param {string} newsId - News article ID for folder organization
 * @returns {Promise} - Upload response with secure_url and public_id
 */
export const uploadNewsThumbnail = async (filePath, newsId) => {
  try {
    if (!filePath || !newsId) {
      throw new Error('Missing required parameters: filePath and newsId');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `cardb/news/${newsId}`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        {
          width: 1200,
          height: 630,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
        },
      ],
      tags: ['news-thumbnail'],
    });

    console.log('News thumbnail uploaded successfully:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'News thumbnail uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading news thumbnail:', error);
    return {
      success: false,
      message: 'Failed to upload news thumbnail',
      error: error.message,
    };
  }
};

/**
 * Upload inline news images (images within article content)
 * @param {string} filePath - Local file path or URL
 * @param {string} newsId - News article ID for folder organization
 * @returns {Promise} - Upload response with secure_url and public_id
 */
export const uploadNewsImage = async (filePath, newsId) => {
  try {
    if (!filePath || !newsId) {
      throw new Error('Missing required parameters: filePath and newsId');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `cardb/news/${newsId}/images`,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        {
          width: 800,
          height: 600,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
        },
      ],
      tags: ['news-image'],
    });

    console.log('News image uploaded successfully:', result.secure_url);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'News image uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading news image:', error);
    return {
      success: false,
      message: 'Failed to upload news image',
      error: error.message,
    };
  }
};

/**
 * Upload multiple news images
 * @param {Array} filePaths - Array of local file paths or URLs
 * @param {string} newsId - News article ID for folder organization
 * @returns {Promise} - Array of upload responses
 */
export const uploadMultipleNewsImages = async (filePaths, newsId) => {
  try {
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      throw new Error('Missing required parameters: filePaths must be a non-empty array');
    }

    if (!newsId) {
      throw new Error('Missing required parameter: newsId');
    }

    const uploadPromises = filePaths.map((filePath) =>
      uploadNewsImage(filePath, newsId)
    );

    const results = await Promise.all(uploadPromises);

    const successfulUploads = results.filter((r) => r.success);
    const failedUploads = results.filter((r) => !r.success);

    console.log(
      `Uploaded ${successfulUploads.length} out of ${results.length} news images`
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
    console.error('Error uploading multiple news images:', error);
    return {
      success: false,
      message: 'Failed to upload news images',
      error: error.message,
    };
  }
};

/**
 * Delete news image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise} - Delete response
 */
export const deleteNewsImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Missing required parameter: publicId');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('News image deleted successfully:', result);
    return {
      success: true,
      message: 'News image deleted successfully',
      result,
    };
  } catch (error) {
    console.error('Error deleting news image:', error);
    return {
      success: false,
      message: 'Failed to delete news image',
      error: error.message,
    };
  }
};

export default {
  uploadNewsThumbnail,
  uploadNewsImage,
  uploadMultipleNewsImages,
  deleteNewsImage,
};
