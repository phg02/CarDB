import axios from 'axios';

const MARKETCHECK_API_KEY = process.env.MARKETCHECK_API_KEY;
const MARKETCHECK_BASE_URL = process.env.MARKETCHECK_BASE_URL;

/**
 * Validate that required environment variables are set
 */
const validateEnvironment = () => {
  if (!MARKETCHECK_API_KEY) {
    throw new Error('MARKETCHECK_API_KEY environment variable is not set');
  }
  if (!MARKETCHECK_BASE_URL) {
    throw new Error('MARKETCHECK_BASE_URL environment variable is not set');
  }
};

/**
 * Decode VIN using MarketCheck API
 * @param {string} vin - The 17-character VIN to decode
 * @returns {Object} Decoded vehicle information
 */
export const decodeVIN = async (vin) => {
  // Validate environment variables
  validateEnvironment();

  try {
    const response = await axios.get(`${MARKETCHECK_BASE_URL}/decode/car/neovin/${vin}/specs`, {
      params: {
        api_key: MARKETCHECK_API_KEY
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('VIN decoding error:', error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to decode VIN',
      status: error.response?.status || 500
    };
  }
};

/**
 * Validate VIN format
 * @param {string} vin - VIN to validate
 * @returns {boolean} True if valid format
 */
export const validateVIN = (vin) => {
  // Basic VIN validation - should be 17 characters, alphanumeric
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin.toUpperCase());
};