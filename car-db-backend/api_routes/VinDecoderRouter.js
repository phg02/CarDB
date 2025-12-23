import express from 'express';
import { decodeVinController } from '../controller/vinDecoderController.js';

const router = express.Router();

/**
 * Decode VIN using MarketCheck API
 * GET /api/vin/decode/:vin
 */
router.get('/decode/:vin', decodeVinController);

export default router;