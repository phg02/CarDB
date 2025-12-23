import CarPost from '../model/CarPost.js';
import { VIETNAM_CITIES } from '../services/vietnamCities.js';
import { VIETNAM_CAR_BRANDS, VIETNAM_CAR_MODELS } from '../services/vietnamCarBrands.js';


/**
 * Get all unique car brands/makes from verified car posts
 * @route GET /api/filters/brands
 */
export const getBrands = async (req, res) => {
  try {
    const brands = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('make')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Brands retrieved successfully',
      data: brands.filter(brand => brand), // Filter out null/undefined
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message,
    });
  }
};

/**
 * Get all unique car years - all years if no brand, or filtered by brand
 * @route GET /api/filters/years
 * @query {string} brand - Optional brand filter
 */
export const getYears = async (req, res) => {
  try {
    const { brand } = req.query;

    // If no brand provided, return comprehensive year list
    if (!brand) {
      const currentYear = new Date().getFullYear();
      const startYear = 1990;
      const allYears = [];
      for (let year = currentYear; year >= startYear; year--) {
        allYears.push(year);
      }

      return res.status(200).json({
        success: true,
        message: 'All years retrieved successfully',
        data: allYears,
      });
    }

    // If brand provided, fetch years from database for that brand
    const query = {
      isDeleted: false,
      verified: true,
      make: { $regex: brand, $options: 'i' }
    };

    const years = await CarPost.find(query)
      .distinct('year')
      .sort({ $natural: -1 }); // Sort descending (newest first)

    res.status(200).json({
      success: true,
      message: 'Years retrieved successfully',
      data: years.filter(year => year), // Filter out null/undefined
    });
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch years',
      error: error.message,
    });
  }
};

/**
 * Get all unique models for a specific brand
 * @route GET /api/filters/models/:brand
 */
export const getModelsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;

    const models = await CarPost.find({
      isDeleted: false,
      verified: true,
      make: { $regex: brand, $options: 'i' }
    })
      .distinct('model')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Models retrieved successfully',
      data: models.filter(model => model),
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: error.message,
    });
  }
};

/**
 * Get all unique body types from schema enum
 * @route GET /api/filters/body-types
 */
export const getBodyTypes = async (req, res) => {
  try {
    // Return body types from schema enum to ensure consistency
    const bodyTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'];

    res.status(200).json({
      success: true,
      message: 'Body types retrieved successfully',
      data: bodyTypes,
    });
  } catch (error) {
    console.error('Error fetching body types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch body types',
      error: error.message,
    });
  }
};

/**
 * Get all unique transmission types
 * @route GET /api/filters/transmissions
 */
export const getTransmissions = async (req, res) => {
  try {
    const transmissions = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('transmission')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Transmissions retrieved successfully',
      data: transmissions.filter(type => type),
    });
  } catch (error) {
    console.error('Error fetching transmissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transmissions',
      error: error.message,
    });
  }
};

/**
 * Get all unique fuel types from schema enum
 * @route GET /api/filters/fuel-types
 */
export const getFuelTypes = async (req, res) => {
  try {
    // Return fuel types from schema enum to ensure consistency
    const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];

    res.status(200).json({
      success: true,
      message: 'Fuel types retrieved successfully',
      data: fuelTypes,
    });
  } catch (error) {
    console.error('Error fetching fuel types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fuel types',
      error: error.message,
    });
  }
};

/**
 * Get all unique drivetrains
 * @route GET /api/filters/drivetrains
 */
export const getDrivetrains = async (req, res) => {
  try {
    const drivetrains = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('drivetrain')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Drivetrains retrieved successfully',
      data: drivetrains.filter(type => type),
    });
  } catch (error) {
    console.error('Error fetching drivetrains:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivetrains',
      error: error.message,
    });
  }
};

/**
 * Get all unique exterior colors
 * @route GET /api/filters/colors
 */
export const getColors = async (req, res) => {
  try {
    const colors = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('exterior_color')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Colors retrieved successfully',
      data: colors.filter(color => color),
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colors',
      error: error.message,
    });
  }
};

/**
 * Get all unique cities
 * @route GET /api/filters/cities
 */
export const getCities = async (req, res) => {
  try {
    const { brand } = req.query;

    // If no brand provided, return full Vietnam cities list
    if (!brand) {
      return res.status(200).json({
        success: true,
        message: 'Vietnam cities retrieved successfully',
        data: VIETNAM_CITIES,
      });
    }

    const query = {
      isDeleted: false,
      verified: true,
      'dealer.city': { $exists: true, $ne: null, $ne: '' }
    };

    if (brand) {
      query.make = { $regex: brand, $options: 'i' };
    }

    const rawCities = await CarPost.find(query).distinct('dealer.city');
    const cities = (rawCities || []).filter(Boolean).sort();

    res.status(200).json({
      success: true,
      message: 'Cities retrieved successfully',
      data: cities,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cities',
      error: error.message,
    });
  }
};

/**
 * Get all unique seating options
 * @route GET /api/filters/seats
 */
export const getSeats = async (req, res) => {
  try {
    const seats = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('std_seating')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Seating options retrieved successfully',
      data: seats.filter(seat => seat),
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seats',
      error: error.message,
    });
  }
};

/**
 * Get all filter options at once
 * @route GET /api/filters/all
 */
export const getAllFilters = async (req, res) => {
  try {
    const verified = { isDeleted: false, verified: true };

    const [brands, transmissions, drivetrains, colors, seats] = await Promise.all([
      CarPost.find(verified).distinct('make'),
      CarPost.find(verified).distinct('transmission'),
      CarPost.find(verified).distinct('drivetrain'),
      CarPost.find(verified).distinct('exterior_color'),
      CarPost.find(verified).distinct('std_seating'),
    ]);

    // Get cities separately with filtering
    const cities = await CarPost.find({ 
      ...verified,
      'dealer.city': { $exists: true, $ne: null, $ne: '' }
    }).distinct('dealer.city');

    // Use schema enum values for body types and fuel types
    const bodyTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'];
    const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];

    // Generate comprehensive year list (1990 to current year)
    const currentYear = new Date().getFullYear();
    const startYear = 1990;
    const allYears = [];
    for (let year = currentYear; year >= startYear; year--) {
      allYears.push(year);
    }

    res.status(200).json({
      success: true,
      message: 'All filter options retrieved successfully',
      data: {
        brands: brands.filter(b => b).sort(),
        years: allYears,
        bodyTypes: bodyTypes,
        transmissions: transmissions.filter(t => t).sort(),
        fuelTypes: fuelTypes,
        drivetrains: drivetrains.filter(dt => dt).sort(),
        colors: colors.filter(c => c).sort(),
        cities: cities.filter(c => c).sort(),
        seats: seats.filter(s => s).sort(),
      },
    });
  } catch (error) {
    console.error('Error fetching all filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message,
    });
  }
};

/**
 * Get all car brands available in Vietnam (for post creation)
 * @route GET /api/filters/vietnam-brands
 */
export const getVietnamBrands = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Vietnam car brands retrieved successfully',
      data: VIETNAM_CAR_BRANDS,
    });
  } catch (error) {
    console.error('Error fetching Vietnam brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Vietnam brands',
      error: error.message,
    });
  }
};

/**
 * Get all models for a specific brand in Vietnam (for post creation)
 * @route GET /api/filters/vietnam-models/:brand
 */
export const getVietnamModels = async (req, res) => {
  try {
    const { brand } = req.params;

    // Find the brand (case-insensitive)
    const brandKey = VIETNAM_CAR_BRANDS.find(
      b => b.toLowerCase() === brand.toLowerCase()
    );

    if (!brandKey || !VIETNAM_CAR_MODELS[brandKey]) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: 'Models retrieved successfully',
      data: VIETNAM_CAR_MODELS[brandKey],
    });
  } catch (error) {
    console.error('Error fetching Vietnam models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: error.message,
    });
  }
};

