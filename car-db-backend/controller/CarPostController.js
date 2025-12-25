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
 * SECURITY: Uses authenticated user ID from JWT token (req.user.userId)
 */
export const initiateCarPost = async (req, res) => {
  try {
    // Get user ID from authenticated token (secure method)
    const sellerId = req.user.userId;
    
    // With multer.any(), form fields are in req.files as non-file objects
    // and actual files are also in req.files with buffer property
    let carData = {};
    let photoFiles = [];

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(item => {
        // Check if this is a file upload (has mimetype for images)
        if (item.mimetype && item.mimetype.startsWith('image/')) {
          photoFiles.push(item);
        } else if (item.mimetype && item.mimetype.startsWith('application/')) {
          photoFiles.push(item);
        } else {
          // This is a form field
          carData[item.fieldname] = item.value;
        }
      });
    }

    // Also merge in any fields from req.body (Express JSON parser)
    if (req.body && typeof req.body === 'object') {
      carData = { ...carData, ...req.body };
    }

    // Reconstruct dealer object from FormData fields
    const dealerFields = {};
    Object.keys(carData).forEach(key => {
      if (key.startsWith('dealer[') && key.endsWith(']')) {
        const dealerKey = key.slice(7, -1); // Extract key from dealer[key]
        dealerFields[dealerKey] = carData[key];
        delete carData[key]; // Remove the individual field
      }
    });
    if (Object.keys(dealerFields).length > 0) {
      carData.dealer = dealerFields;
    }
    
    console.log('Received car data:', Object.keys(carData));
    console.log('Dealer object:', carData.dealer);
    console.log('Received files:', photoFiles.length);
    
    // Validate that we have carData
    if (!carData || Object.keys(carData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No form data received. Please ensure FormData is properly formatted.',
        debug: {
          filesCount: req.files?.length || 0,
          bodyKeys: Object.keys(req.body || {}),
        }
      });
    }

    // Validate seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Validate required fields - check if heading exists (can be sent as different field names)
    const heading = carData.heading || carData.title;
    const price = carData.price;
    const miles = carData.miles;
    
    if (!heading || !price || miles === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: heading (or title), price, miles',
        received: { heading, price, miles },
        allKeys: Object.keys(carData)
      });
    }

    // Handle image uploads
    let photoLinks = [];
    if (photoFiles && photoFiles.length > 0) {
      const uploadResult = await uploadMultipleCarPhotos(photoFiles, sellerId);

      if (!uploadResult.success && uploadResult.uploadedUrls.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload car photos',
          error: uploadResult.error,
          validationErrors: uploadResult.validationErrors,
        });
      }
      photoLinks = uploadResult.uploadedUrls;
    }

    // Create the car post immediately (unpaid status)
    const newCarPost = new CarPost({
      seller: sellerId,
      ...carData,
      photo_links: photoLinks,
      verified: false, // Not paid yet
    });

    await newCarPost.save();

    // Create posting fee payment record for tracking payment
    const postingFee = new PostingFee({
      seller: sellerId,
      carPost: newCarPost._id, // Link to the car post
      carData: carData,
      photoLinks: photoLinks,
      amount: POSTING_FEE,
      paymentStatus: 'pending',
    });

    await postingFee.save();

    res.status(201).json({
      success: true,
      message: 'Car post created successfully. Please complete payment to publish your listing.',
      data: {
        carPostId: newCarPost._id,
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
        message: 'Payment not completed. Cannot publish post.',
      });
    }

    if (!postingFee.carPost) {
      // Create the actual car post from the posting fee data
      const newCarPost = new CarPost({
        seller: postingFee.seller,
        ...postingFee.carData,
        photo_links: postingFee.photoLinks,
        paymentStatus: 'paid', // Mark as paid after successful payment
        verified: false, // Not verified yet - waiting for admin approval
      });

      await newCarPost.save();

      // Update posting fee to link to the created car post
      postingFee.carPost = newCarPost._id;
      await postingFee.save();

      res.status(200).json({
        success: true,
        message: 'Payment successful! Your car post is now awaiting admin verification.',
        data: newCarPost,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'This posting fee has already been used to create a car post',
      });
    }
  } catch (error) {
    console.error('Error publishing car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish car post',
      error: error.message,
    });
  }
};

// ==================== READ ====================
/**
 * Get all verified car posts (for regular users)
 * Only shows posts that are verified by admin and have been paid
 * @route GET /api/cars
 */
export const getAllCarPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      status, 
      minPrice, 
      maxPrice, 
      make, 
      model, 
      year, 
      inventory_type,
      body_type,
      transmission,
      fuel_type,
      drivetrain,
      exterior_color,
      city,
      seats
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Only show verified posts (admin approved)
    const filter = { isDeleted: false, verified: true };

    // Apply filters - Status (New/Used)
    if (status) filter.inventory_type = status.toLowerCase();
    
    // Apply filters - Year
    if (year) filter.year = parseInt(year);
    
    // Apply filters - Brand/Make
    if (make) filter.make = { $regex: make, $options: 'i' };
    
    // Apply filters - Model
    if (model) filter.model = { $regex: model, $options: 'i' };
    
    // Apply filters - Body Type
    if (body_type) filter.body_type = { $regex: body_type, $options: 'i' };
    
    // Apply filters - Transmission
    if (transmission) filter.transmission = { $regex: transmission, $options: 'i' };
    
    // Apply filters - Fuel Type
    if (fuel_type) filter.fuel_type = { $regex: fuel_type, $options: 'i' };
    
    // Apply filters - Drivetrain
    if (drivetrain) filter.drivetrain = { $regex: drivetrain, $options: 'i' };
    
    // Apply filters - Exterior Color
    if (exterior_color) filter.exterior_color = { $regex: exterior_color, $options: 'i' };
    
    // Apply filters - City
    if (city) filter['dealer.city'] = { $regex: city, $options: 'i' };
    
    // Apply filters - Seats
    if (seats) filter.std_seating = seats.toString();
    
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
 * Get all car posts for admin (including paid/verified and unpaid/unverified)
 * @route GET /api/cars/admin/all
 * Query params: verified=true (paid), verified=false (unpaid), verified=all (both)
 */
export const getAllCarPostsAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      verified = 'all',
      status, 
      minPrice, 
      maxPrice, 
      make, 
      model,
      year, 
      inventory_type,
      body_type,
      transmission,
      fuel_type,
      drivetrain,
      exterior_color,
      city,
      seats
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isDeleted: false };

    // Apply verified filter: 'true' (paid), 'false' (unpaid), 'all' (both)
    if (verified === 'true') {
      filter.verified = true;
    } else if (verified === 'false') {
      filter.verified = false;
    }
    // If 'all' or undefined, no verified filter is applied

    // Apply filters - Status (New/Used)
    if (status) filter.inventory_type = status.toLowerCase();
    
    // Apply filters - Year
    if (year) filter.year = parseInt(year);
    
    // Apply filters - Brand/Make
    if (make) filter.make = { $regex: make, $options: 'i' };
    
    // Apply filters - Model
    if (model) filter.model = { $regex: model, $options: 'i' };
    
    // Apply filters - Body Type
    if (body_type) filter.body_type = { $regex: body_type, $options: 'i' };
    
    // Apply filters - Transmission
    if (transmission) filter.transmission = { $regex: transmission, $options: 'i' };
    
    // Apply filters - Fuel Type
    if (fuel_type) filter.fuel_type = { $regex: fuel_type, $options: 'i' };
    
    // Apply filters - Drivetrain
    if (drivetrain) filter.drivetrain = { $regex: drivetrain, $options: 'i' };
    
    // Apply filters - Exterior Color
    if (exterior_color) filter.exterior_color = { $regex: exterior_color, $options: 'i' };
    
    // Apply filters - City
    if (city) filter['dealer.city'] = { $regex: city, $options: 'i' };
    
    // Apply filters - Seats
    if (seats) filter.std_seating = seats.toString();
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const carPosts = await CarPost.find(filter)
      .populate('seller', 'name email phone')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CarPost.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'All car posts retrieved successfully',
      data: carPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching all car posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car posts',
      error: error.message,
    });
  }
};

/**
 * Get all paid and unverified car posts (for admin review)
 * @route GET /api/cars/admin/unverified
 * Shows posts that have been paid but not yet verified by admin
 */
export const getUnverifiedCarPosts = async (req, res) => {
  try {
    const { page = 1, limit = 12, make, year } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    // Filter for paid (paymentStatus = 'paid') AND unverified (verified = false)
    const filter = { isDeleted: false, paymentStatus: 'paid', verified: false };

    if (make) filter.make = { $regex: make, $options: 'i' };
    if (year) filter.year = parseInt(year);

    const carPosts = await CarPost.find(filter)
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CarPost.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Paid and unverified car posts retrieved successfully',
      data: carPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching unverified posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unverified posts',
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
 * Get all car posts by seller (authenticated user)
 * @route GET /api/cars/seller
 * SECURITY: Uses authenticated user ID from JWT token instead of route parameter
 */
export const getCarPostsBySeller = async (req, res) => {
  try {
    // Get user ID from authenticated token (secure method)
    const sellerId = req.user.userId;
    const { page = 1, limit = 12 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    // Get all car posts by seller with pagination
    const carPosts = await CarPost.find({ seller: sellerId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('approvedBy', 'name')
      .lean();

    // Get total count for pagination
    const totalItems = await CarPost.countDocuments({ seller: sellerId, isDeleted: false });

    // Get posting fees for these car posts to determine payment status
    const carPostIds = carPosts.map(post => post._id);
    const postingFees = await PostingFee.find({
      seller: sellerId,
      carPost: { $in: carPostIds }
    }).lean();

    // Create a map of carPost ID to posting fee
    const postingFeeMap = {};
    postingFees.forEach(fee => {
      postingFeeMap[fee.carPost.toString()] = fee;
    });

    // Add payment information to car posts
    const postsWithPaymentInfo = carPosts.map(post => {
      const postingFee = postingFeeMap[post._id.toString()];
      return {
        ...post,
        paymentStatus: postingFee ? postingFee.paymentStatus : 'unknown',
        postingFee: postingFee ? {
          _id: postingFee._id,
          amount: postingFee.amount
        } : null
      };
    });

    res.status(200).json({
      success: true,
      message: 'Seller car posts retrieved successfully',
      data: postsWithPaymentInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems: totalItems,
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

// ==================== ADMIN APPROVAL ====================
/**
 * Approve car post (admin only)
 * Mark as verified - only possible if posting fee has been paid
 * @route PATCH /api/cars/admin/:id/approve
 */
export const approveCarPost = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.user?.userId; // From auth middleware

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin authentication required.',
      });
    }

    const carPost = await CarPost.findById(id);

    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    // Check if posting fee has been paid (paymentStatus = 'paid')
    if (carPost.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot verify this post. The posting fee has not been paid yet.',
        currentPaymentStatus: carPost.paymentStatus,
      });
    }

    // Verify the post (only if paid)
    carPost.verified = true;
    carPost.approvedBy = adminId;
    carPost.approvedAt = new Date();
    carPost.rejectionReason = null;
    await carPost.save();

    // Add to seller's selling list
    await User.findByIdAndUpdate(
      carPost.seller,
      { $addToSet: { sellingList: carPost._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Car post verified successfully and added to seller listing',
      data: {
        carPost,
        approvedAt: carPost.approvedAt,
        approvedBy: carPost.approvedBy,
      },
    });
  } catch (error) {
    console.error('Error verifying car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify car post',
      error: error.message,
    });
  }
};

/**
 * Reject car post (admin only)
 * @route PATCH /api/cars/admin/:id/reject
 */
export const rejectCarPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason',
      });
    }

    const carPost = await CarPost.findById(id);

    if (!carPost) {
      return res.status(404).json({
        success: false,
        message: 'Car post not found',
      });
    }

    // Reject the post
    carPost.verified = false;
    carPost.rejectionReason = reason;
    carPost.approvedBy = null;
    carPost.approvedAt = null;
    await carPost.save();

    res.status(200).json({
      success: true,
      message: 'Car post rejected successfully',
      data: {
        carPost,
        rejectionReason: carPost.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Error rejecting car post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject car post',
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
  initiateCarPost,
  createCarPost,
  getAllCarPosts,
  getAllCarPostsAdmin,
  getUnverifiedCarPosts,
  getCarPostById,
  getCarPostsBySeller,
  updateCarPost,
  removeCarPhoto,
  deleteCarPost,
  permanentlyDeleteCarPost,
  markCarAsSold,
  markCarAsAvailable,
  approveCarPost,
  rejectCarPost,
  addToWatchlist,
  removeFromWatchlist,
};
