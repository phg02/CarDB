import express from 'express';
import multer from 'multer';
import * as carPostController from '../controller/CarPostController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// ==================== CREATE ====================
/**
 * Initiate car post (step 1: upload details and pay posting fee)
 * POST /api/cars/initiate/:sellerId
 * Body: Car details + images as multipart/form-data
 * Returns: postingFeeId to use for VNPay payment
 */
router.post('/initiate/:sellerId', upload.array('photos', 10), carPostController.initiateCarPost);

/**
 * Create car post after payment (step 2: called after successful VNPay payment)
 * POST /api/cars/create
 * Body: { postingFeeId }
 * Internal endpoint - called by payment callback
 */
router.post('/create', carPostController.createCarPost);

// ==================== READ ====================
/**
 * Get all car posts with filtering and pagination
 * GET /api/cars?page=1&limit=12&status=Available&minPrice=1000&maxPrice=50000&make=Toyota&year=2020&inventory_type=used
 */
router.get('/', carPostController.getAllCarPosts);

/**
 * Get car posts by seller with pagination
 * GET /api/cars/seller/:sellerId?page=1&limit=10
 */
router.get('/seller/:sellerId', carPostController.getCarPostsBySeller);

/**
 * Get a single car post by ID
 * GET /api/cars/:id
 */
router.get('/:id', carPostController.getCarPostById);

// ==================== UPDATE ====================
/**
 * Update car post details and add new images
 * PUT /api/cars/:id
 * Body: Updated car details + optional new images
 */
router.put('/:id', upload.array('photos', 10), carPostController.updateCarPost);

/**
 * Remove specific photo from car post
 * DELETE /api/cars/:id/photo/:photoIndex
 */
router.delete('/:id/photo/:photoIndex', carPostController.removeCarPhoto);

// ==================== DELETE ====================
/**
 * Soft delete car post (mark as deleted, keep data)
 * DELETE /api/cars/:id
 */
router.delete('/:id', carPostController.deleteCarPost);

/**
 * Permanently delete car post with image cleanup
 * DELETE /api/cars/:id/permanent
 */
router.delete('/:id/permanent', carPostController.permanentlyDeleteCarPost);

// ==================== STATUS MANAGEMENT ====================
/**
 * Mark car as sold
 * PATCH /api/cars/:id/sold
 */
router.patch('/:id/sold', carPostController.markCarAsSold);

/**
 * Mark car as available
 * PATCH /api/cars/:id/available
 */
router.patch('/:id/available', carPostController.markCarAsAvailable);

// ==================== WATCHLIST ====================
/**
 * Add car to user's watchlist
 * POST /api/cars/:carId/watchlist/:userId
 */
router.post('/:carId/watchlist/:userId', carPostController.addToWatchlist);

/**
 * Remove car from user's watchlist
 * DELETE /api/cars/:carId/watchlist/:userId
 */
router.delete('/:carId/watchlist/:userId', carPostController.removeFromWatchlist);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed',
      });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'File upload error',
    });
  }
  
  next();
});

export default router;