import CarPost from '../model/CarPost.js';
import User from '../model/User.js';
import PostingFee from '../model/PostingFee.js';
import { uploadCarPhoto, uploadMultipleCarPhotos, deleteCarPhoto } from '../services/carPhotoService.js';

// POSTING FEE CONSTANT
const POSTING_FEE = 15000; // 15,000 VND

// ==================== CREATE ====================
/**
 * Initiate posting - Create posting fee payment
 * @route POST /api/cars/initiate
 * User uploads car data and photos, then pays posting fee via VNPay
 */
export const initiateCarPost = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const carData = req.body;

    // Validate seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Validate required fields
    if (!carData.heading || !carData.price || carData.miles === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: heading, price, miles',
      });
    }

    // Handle image uploads
    let photoLinks = [];
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map((file) => file.path);
      const uploadResult = await uploadMultipleCarPhotos(filePaths, sellerId);

      if (!uploadResult.success && uploadResult.uploadedUrls.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload car photos',
          error: uploadResult.error,
        });
      }
      photoLinks = uploadResult.uploadedUrls;
    }

    // Create posting fee payment record
    const postingFee = new PostingFee({
      seller: sellerId,
      carData: carData,
      photoLinks: photoLinks,
      amount: POSTING_FEE,
      paymentStatus: 'pending',
    });

    await postingFee.save();

    res.status(201).json({
      success: true,
      message: 'Posting initiated. Please proceed to payment.',
      data: {
        postingFeeId: postingFee._id,
        amount: POSTING_FEE,
        message: 'You need to pay 15,000 VND posting fee to publish your car listing',
      },
    });
  } catch (error) {
    console.error('Error initiating car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate car post',
      error: error.message,
    });
  }
};

/**
 * Create a new car post (called after successful payment)
 * @route POST /api/cars
 * This is an INTERNAL endpoint - called by payment callback
 */
export const createCarPost = async (req, res) => {
  try {
    const { postingFeeId } = req.body;

    // Validate posting fee exists and is paid
    const postingFee = await PostingFee.findById(postingFeeId);
    if (!postingFee) {
      return res.status(404).json({ success: false, message: 'Posting fee not found' });
    }

    if (postingFee.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed. Cannot create post.',
      });
    }

    if (postingFee.carPost) {
      return res.status(400).json({
        success: false,
        message: 'Post already created for this payment',
        data: { carPost: postingFee.carPost },
      });
    }

    // Create car post from stored data
    const newCarPost = new CarPost({
      seller: postingFee.seller,
      ...postingFee.carData,
      photo_links: postingFee.photoLinks,
    });

    await newCarPost.save();

    // Add to seller's selling list
    await User.findByIdAndUpdate(
      postingFee.seller,
      { $push: { sellingList: newCarPost._id } },
      { new: true }
    );

    // Update posting fee with created post reference
    await PostingFee.findByIdAndUpdate(
      postingFeeId,
      { carPost: newCarPost._id },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Car post created successfully after payment',
      data: newCarPost,
    });
  } catch (error) {
    console.error('Error creating car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create car post',
      error: error.message,
    });
  }
};

// ==================== READ ====================
/**
 * Get all car posts with filtering and pagination
 * @route GET /api/cars
 */
export const getAllCarPosts = async (req, res) => {
  try {
    const { page = 1, limit = 12, status, minPrice, maxPrice, make, year, inventory_type } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isDeleted: false };

    // Apply filters
    if (status) filter.status = status;
    if (inventory_type) filter.inventory_type = inventory_type;
    if (make) filter.make = { $regex: make, $options: 'i' };
    if (year) filter.year = parseInt(year);
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const carPosts = await CarPost.find(filter)
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CarPost.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Car posts retrieved successfully',
      data: carPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching car posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car posts',
      error: error.message,
    });
  }
};

/**
 * Get car post by ID
 * @route GET /api/cars/:id
 */
export const getCarPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const carPost = await CarPost.findById(id)
      .populate('seller', 'name email phone');

    if (!carPost || carPost.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car post retrieved successfully',
      data: carPost,
    });
  } catch (error) {
    console.error('Error fetching car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car post',
      error: error.message,
    });
  }
};

/**
 * Get all car posts by seller
 * @route GET /api/cars/seller/:sellerId
 */
export const getCarPostsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    const carPosts = await CarPost.find({ seller: sellerId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await CarPost.countDocuments({
      seller: sellerId,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      message: 'Seller car posts retrieved successfully',
      data: carPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Error fetching seller car posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller car posts',
      error: error.message,
    });
  }
};

// ==================== UPDATE ====================
/**
 * Update car post details
 * @route PUT /api/cars/:id
 */
export const updateCarPost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const carPost = await CarPost.findById(id);
    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    let photoLinks = [...(carPost.photo_links || [])];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map((file) => file.path);
      const uploadResult = await uploadMultipleCarPhotos(filePaths, carPost.seller);

      if (uploadResult.success && uploadResult.uploadedUrls.length > 0) {
        photoLinks = [...photoLinks, ...uploadResult.uploadedUrls];
      }
    }

    // Update car post
    const updatedCarPost = await CarPost.findByIdAndUpdate(
      id,
      { ...updateData, photo_links: photoLinks },
      { new: true, runValidators: true }
    ).populate('seller', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Car post updated successfully',
      data: updatedCarPost,
    });
  } catch (error) {
    console.error('Error updating car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car post',
      error: error.message,
    });
  }
};

/**
 * Remove specific photo from car post
 * @route DELETE /api/cars/:id/photo/:photoIndex
 */
export const removeCarPhoto = async (req, res) => {
  try {
    const { id, photoIndex } = req.params;

    const carPost = await CarPost.findById(id);
    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    const index = parseInt(photoIndex);
    if (index < 0 || index >= carPost.photo_links.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo index',
      });
    }

    // Remove photo from array
    carPost.photo_links.splice(index, 1);
    await carPost.save();

    res.status(200).json({
      success: true,
      message: 'Photo removed successfully',
      data: carPost,
    });
  } catch (error) {
    console.error('Error removing car photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove photo',
      error: error.message,
    });
  }
};

// ==================== DELETE ====================
/**
 * Soft delete car post (mark as deleted)
 * @route DELETE /api/cars/:id
 */
export const deleteCarPost = async (req, res) => {
  try {
    const { id } = req.params;

    const carPost = await CarPost.findById(id);
    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    // Soft delete
    carPost.isDeleted = true;
    carPost.deletedAt = new Date();
    await carPost.save();

    // Remove from seller's selling list
    await User.findByIdAndUpdate(
      carPost.seller,
      { $pull: { sellingList: id } }
    );

    res.status(200).json({
      success: true,
      message: 'Car post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car post',
      error: error.message,
    });
  }
};

/**
 * Permanently delete car post with image cleanup
 * @route DELETE /api/cars/:id/permanent
 */
export const permanentlyDeleteCarPost = async (req, res) => {
  try {
    const { id } = req.params;

    const carPost = await CarPost.findById(id);
    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    // Delete images from Cloudinary
    if (carPost.photo_links && carPost.photo_links.length > 0) {
      for (const photoUrl of carPost.photo_links) {
        try {
          const filename = photoUrl.split('/').pop();
          const publicId = filename.split('.')[0];
          await deleteCarPhoto(publicId);
        } catch (err) {
          console.warn('Warning: Could not delete image:', err.message);
        }
      }
    }

    // Remove from seller's selling list
    await User.findByIdAndUpdate(
      carPost.seller,
      { $pull: { sellingList: id } }
    );

    // Permanently delete
    await CarPost.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Car post permanently deleted',
    });
  } catch (error) {
    console.error('Error permanently deleting car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete car post',
      error: error.message,
    });
  }
};

// ==================== STATUS MANAGEMENT ====================
/**
 * Mark car as sold
 * @route PATCH /api/cars/:id/sold
 */
export const markCarAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const carPost = await CarPost.findByIdAndUpdate(
      id,
      { sold: true, status: 'Sold' },
      { new: true }
    ).populate('seller', 'name email phone');

    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car marked as sold',
      data: carPost,
    });
  } catch (error) {
    console.error('Error marking car as sold:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark car as sold',
      error: error.message,
    });
  }
};

/**
 * Mark car as available
 * @route PATCH /api/cars/:id/available
 */
export const markCarAsAvailable = async (req, res) => {
  try {
    const { id } = req.params;

    const carPost = await CarPost.findByIdAndUpdate(
      id,
      { sold: false, status: 'Available' },
      { new: true }
    ).populate('seller', 'name email phone');

    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car marked as available',
      data: carPost,
    });
  } catch (error) {
    console.error('Error marking car as available:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark car as available',
      error: error.message,
    });
  }
};

// ==================== WATCHLIST ====================
/**
 * Add car to user's watchlist
 * @route POST /api/cars/:carId/watchlist/:userId
 */
export const addToWatchlist = async (req, res) => {
  try {
    const { carId, userId } = req.params;

    // Verify car exists
    const carPost = await CarPost.findById(carId);
    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add to watchlist
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchlist: carId } },
      { new: true }
    ).select('watchlist');

    res.status(200).json({
      success: true,
      message: 'Car added to watchlist',
      data: { watchlistCount: updatedUser.watchlist.length },
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to watchlist',
      error: error.message,
    });
  }
};

/**
 * Remove car from user's watchlist
 * @route DELETE /api/cars/:carId/watchlist/:userId
 */
export const removeFromWatchlist = async (req, res) => {
  try {
    const { carId, userId } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { watchlist: carId } },
      { new: true }
    ).select('watchlist');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car removed from watchlist',
      data: { watchlistCount: updatedUser.watchlist.length },
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from watchlist',
      error: error.message,
    });
  }
};

export default {
  createCarPost,
  getAllCarPosts,
  getCarPostById,
  getCarPostsBySeller,
  updateCarPost,
  removeCarPhoto,
  deleteCarPost,
  permanentlyDeleteCarPost,
  markCarAsSold,
  markCarAsAvailable,
  addToWatchlist,
  removeFromWatchlist,
};
