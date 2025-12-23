import express from 'express';
import {
  getBrands,
  getYears,
  getModelsByBrand,
  getBodyTypes,
  getTransmissions,
  getFuelTypes,
  getDrivetrains,
  getColors,
  getCities,
  getSeats,
  getAllFilters,
} from '../controller/FilterController.js';

const router = express.Router();

/**
 * Get all filter options at once (most efficient)
 * GET /api/filters/all
 */
router.get('/all', getAllFilters);

/**
 * Get all unique car brands
 * GET /api/filters/brands
 */
router.get('/brands', getBrands);

/**
 * Get all unique years
 * GET /api/filters/years
 */
router.get('/years', getYears);

/**
 * Get all unique models for a specific brand
 * GET /api/filters/models/:brand
 */
router.get('/models/:brand', getModelsByBrand);

/**
 * Get all unique body types
 * GET /api/filters/body-types
 */
router.get('/body-types', getBodyTypes);

/**
 * Get all unique transmissions
 * GET /api/filters/transmissions
 */
router.get('/transmissions', getTransmissions);

/**
 * Get all unique fuel types
 * GET /api/filters/fuel-types
 */
router.get('/fuel-types', getFuelTypes);

/**
 * Get all unique drivetrains
 * GET /api/filters/drivetrains
 */
router.get('/drivetrains', getDrivetrains);

/**
 * Get all unique colors
 * GET /api/filters/colors
 */
router.get('/colors', getColors);

/**
 * Get all unique cities
 * GET /api/filters/cities
 */
router.get('/cities', getCities);

/**
 * Get all unique seating options
 * GET /api/filters/seats
 */
router.get('/seats', getSeats);

export default router;
