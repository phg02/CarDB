import express from 'express';
import multer from 'multer';
import * as carPostController from '../controller/CarPostController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { VIETNAM_CAR_BRANDS, VIETNAM_CAR_MODELS } from '../services/vietnamCarBrands.js';
import { COUNTRIES } from '../services/countries.js';

const router = express.Router();

// ==================== CAR DATA ENDPOINTS ====================
/**
 * Get all car makes
 * GET /api/cars/makes
 */
router.get('/makes', (req, res) => {
  res.json({ success: true, data: VIETNAM_CAR_BRANDS });
});

/**
 * Get models for a specific make
 * GET /api/cars/models/:make
 */
router.get('/models/:make', (req, res) => {
  const { make } = req.params;

  const models = VIETNAM_CAR_MODELS[make] || [];
  res.json({ success: true, data: models });
});

/**
 * Get all engine types
 * GET /api/cars/engines
 */
router.get('/engines', (req, res) => {
  const engines = [
    '2.0L Inline-4',
    '2.5L Inline-4',
    '3.0L V6',
    '3.5L V6',
    '4.0L V6',
    '2.0L Turbo Inline-4',
    '3.0L Turbo V6',
    '4.0L V8',
    '5.0L V8',
    '6.0L V8',
    'Electric Motor',
    '2.0L Hybrid',
    '3.5L Hybrid V6',
    'Inline-4',
    'V6',
    'V8',
    'Turbocharged Inline-4',
    'Turbocharged V6',
    'Naturally Aspirated V8'
  ];
  res.json({ success: true, data: engines });
});

/**
 * Get all countries
 * GET /api/cars/countries
 */
router.get('/countries', (req, res) => {
  res.json({ success: true, data: COUNTRIES });
});

/**
 * Get all body types
 * GET /api/cars/body-types
 */
router.get('/body-types', (req, res) => {
  const bodyTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'];
  res.json({ success: true, data: bodyTypes });
});

/**
 * Get all fuel types
 * GET /api/cars/fuel-types
 */
router.get('/fuel-types', (req, res) => {
  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
  res.json({ success: true, data: fuelTypes });
});

// Configure multer for file uploads with any field names
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

// Create separate uploads configurations
const uploadAny = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
}).any(); // .any() accepts any field names

// For routes that only handle photo uploads
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
 * POST /api/cars/initiate
 * Body: Car details + images as multipart/form-data
 * Returns: postingFeeId to use for VNPay payment
 * SECURITY: Requires authenticated user - user ID taken from JWT token
 */
router.post('/initiate', verifyToken, uploadAny, carPostController.initiateCarPost);

/**
 * Create car post after payment (step 2: called after successful VNPay payment)
 * POST /api/cars/create
 * Body: { postingFeeId }
 * Internal endpoint - called by payment callback
 */
router.post('/create', carPostController.createCarPost);

// ==================== READ ====================
/**
 * Get all verified car posts (for regular users)
 * GET /api/cars?page=1&limit=12&status=Available&minPrice=1000&maxPrice=50000&make=Toyota&year=2020&inventory_type=used
 */
router.get('/', carPostController.getAllCarPosts);

/**
 * Get all car posts for admin (including unverified)
 * Supports filtering by: verified, sold, status, price range, make, model, year, body_type, transmission, fuel_type, drivetrain, exterior_color, city, seats
 * GET /api/cars/admin/all?page=1&limit=12&verified=false&sold=true
 * GET /api/cars/admin/all?sold=true&verified=true (get all sold/verified cars)
 * GET /api/cars/admin/all?sold=false (get all available cars)
 */
router.get('/admin/all', verifyToken, isAdmin, carPostController.getAllCarPostsAdmin);

/**
 * Get all unverified car posts (for admin review)
 * GET /api/cars/admin/unverified?page=1&limit=12
 */
router.get('/admin/unverified', verifyToken, isAdmin, carPostController.getUnverifiedCarPosts);

/**
 * Get car posts by seller (authenticated user)
 * GET /api/cars/seller?page=1&limit=10
 * Returns: All car posts posted by the authenticated seller
 * SECURITY: Requires authenticated user - retrieves their own posts only
 */
router.get('/seller', verifyToken, carPostController.getCarPostsBySeller);

// ==================== WATCHLIST ====================
/**
 * Get current user's watchlist
 * GET /api/cars/watchlist
 * Optionally supports GET /api/cars/watchlist/:userId for compatibility
 */
router.get('/watchlist', verifyToken, carPostController.getWatchlist);
router.get('/watchlist/:userId', verifyToken, carPostController.getWatchlist);

/**
 * Add car to user's watchlist
 * POST /api/cars/:carId/watchlist/:userId
 * NOTE: requires authentication; route param is kept for compatibility
 */
router.post('/:carId/watchlist/:userId', verifyToken, carPostController.addToWatchlist);

/**
 * Remove car from user's watchlist
 * DELETE /api/cars/:carId/watchlist/:userId
 */
router.delete('/:carId/watchlist/:userId', verifyToken, carPostController.removeFromWatchlist);


/**
 * Note: watchlist routes must be placed before the `/:id` param route to avoid
 * Express treating 'watchlist' as an :id value. The watchlist routes were
 * inserted earlier in the file; this `/:id` route remains but comes after them.
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


// ==================== ADMIN APPROVAL ====================
/**
 * Approve car post (admin only)
 * PATCH /api/cars/admin/:id/approve
 */
router.patch('/admin/:id/approve', verifyToken, isAdmin, carPostController.approveCarPost);

/**
 * Reject car post (admin only)
 * PATCH /api/cars/admin/:id/reject
 */
router.patch('/admin/:id/reject', verifyToken, isAdmin, carPostController.rejectCarPost);

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