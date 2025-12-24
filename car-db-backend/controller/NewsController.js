import News from "../model/News.js";
import User from "../model/User.js";
import {
  uploadNewsThumbnail,
  validateImageFile,
} from "../services/newsImageService.js";

// ==================== CREATE NEWS ====================
/**
 * Create a new news post (Admin only)
 * @route POST /api/news/create
 * SECURITY: Requires admin authentication
 * Body: { title, content, images[] }
 * File: thumbnail (optional)
 */
export const createNews = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { title, content, images } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 5 characters long",
      });
    }

    if (content.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Content must be at least 20 characters long",
      });
    }

    // Verify admin exists
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    // Process uploaded image files
    let thumbnailUrl = null;
    let imagesArray = [];

    if (req.files && req.files.length > 0) {
      // Upload all images to Cloudinary
      for (const file of req.files) {
        const validation = validateImageFile(file);
        if (!validation.success) {
          return res.status(400).json({
            success: false,
            message: validation.message,
          });
        }

        const uploadResult = await uploadNewsThumbnail(file.path, adminId);
        if (!uploadResult.success) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
            error: uploadResult.error,
          });
        }

        imagesArray.push(uploadResult.url);
      }

      // First image becomes the thumbnail
      if (imagesArray.length > 0) {
        thumbnailUrl = imagesArray[0];
      }
    }

    // Create news post
    const news = new News({
      title: title.trim(),
      content: content.trim(),
      thumbnail: thumbnailUrl,
      images: imagesArray,
      author: adminId,
    });

    await news.save();
    await news.populate("author", "name email");

    res.status(201).json({
      success: true,
      message: "News post created successfully",
      data: {
        news,
      },
    });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create news post",
      error: error.message,
    });
  }
};

// ==================== READ NEWS ====================
/**
 * Get all news posts for users (published/not deleted only)
 * @route GET /api/news?page=1&limit=10&search=keyword
 * Public endpoint - no authentication required
 */
export const getAllNewsForUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search query
    let query = {
      isDeleted: false,
    };

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const news = await News.find(query)
      .populate("author", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "News posts retrieved successfully",
      data: {
        news,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch news posts",
      error: error.message,
    });
  }
};

/**
 * Get all news posts for admin (including deleted)
 * @route GET /api/news/admin/all?page=1&limit=10&search=keyword&isDeleted=false
 * SECURITY: Requires admin authentication
 */
export const getAllNewsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isDeleted = "false",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};

    if (isDeleted === "true") {
      query.isDeleted = true;
    } else if (isDeleted === "false") {
      query.isDeleted = false;
    }
    // If 'all', no isDeleted filter

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const news = await News.find(query)
      .populate("author", "name email profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "News posts retrieved successfully",
      data: {
        news,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch news posts",
      error: error.message,
    });
  }
};

/**
 * Get a single news post by ID
 * @route GET /api/news/:id
 * Public endpoint - no authentication required
 */
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOne({
      _id: id,
      isDeleted: false,
    }).populate("author", "name email profileImage");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "News post retrieved successfully",
      data: {
        news,
      },
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch news post",
      error: error.message,
    });
  }
};

// ==================== UPDATE NEWS ====================
/**
 * Update news post (Admin only)
 * @route PATCH /api/news/:id
 * SECURITY: Requires admin authentication
 * Body: { title?, content?, images[]? }
 * File: thumbnail (optional)
 */
export const updateNews = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;
    const { title, content, images } = req.body;

    // Find news post
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News post not found",
      });
    }

    if (news.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "News post not found (deleted)",
      });
    }

    // Validate input if provided
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      if (title.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: "Title must be at least 5 characters long",
        });
      }
      news.title = title.trim();
    }

    if (content !== undefined) {
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty",
        });
      }
      if (content.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: "Content must be at least 20 characters long",
        });
      }
      news.content = content.trim();
    }

    if (images !== undefined) {
      if (Array.isArray(images)) {
        news.images = images;
        // Update thumbnail from first image in array
        if (images.length > 0) {
          news.thumbnail = images[0];
        }
      }
    }

    // Upload new thumbnail file if provided (overrides images array thumbnail)
    if (req.file) {
      const validation = validateImageFile(req.file);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: validation.message,
        });
      }

      const uploadResult = await uploadNewsThumbnail(req.file.path, id);
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload thumbnail",
          error: uploadResult.error,
        });
      }
      news.thumbnail = uploadResult.url;
    }

    // Save updates
    await news.save();
    await news.populate("author", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "News post updated successfully",
      data: {
        news,
      },
    });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update news post",
      error: error.message,
    });
  }
};

// ==================== DELETE NEWS ====================
/**
 * Delete news post (soft delete - Admin only)
 * @route DELETE /api/news/:id
 * SECURITY: Requires admin authentication
 */
export const deleteNews = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;

    // Find news post
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News post not found",
      });
    }

    if (news.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "News post already deleted",
      });
    }

    // Soft delete
    news.isDeleted = true;
    news.deletedAt = new Date();
    await news.save();

    res.status(200).json({
      success: true,
      message: "News post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete news post",
      error: error.message,
    });
  }
};

/**
 * Restore deleted news post (Admin only)
 * @route PATCH /api/news/:id/restore
 * SECURITY: Requires admin authentication
 */
export const restoreNews = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;

    // Find news post
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News post not found",
      });
    }

    if (!news.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "News post is not deleted",
      });
    }

    // Restore
    news.isDeleted = false;
    news.deletedAt = null;
    await news.save();
    await news.populate("author", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "News post restored successfully",
      data: {
        news,
      },
    });
  } catch (error) {
    console.error("Error restoring news:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore news post",
      error: error.message,
    });
  }
};
