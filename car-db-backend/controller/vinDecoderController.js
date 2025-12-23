import { decodeVIN, validateVIN } from '../services/vinDecoderService.js';

/**
 * Decode VIN endpoint
 * GET /api/vin/decode/:vin
 */
export const decodeVinController = async (req, res) => {
  try {
    const { vin } = req.params;

    // Validate VIN format
    if (!vin || !validateVIN(vin)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid VIN format. VIN must be 17 characters long and contain only valid characters.'
      });
    }

    // Decode the VIN
    const result = await decodeVIN(vin.toUpperCase());

    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('VIN decoder controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while decoding VIN'
    });
  }
};