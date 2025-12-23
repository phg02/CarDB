import CarPost from '../model/CarPost.js';

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
 * Get all unique car years from verified car posts
 * @route GET /api/filters/years
 */
export const getYears = async (req, res) => {
  try {
    const years = await CarPost.find({ isDeleted: false, verified: true })
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
 * Get all unique body types
 * @route GET /api/filters/body-types
 */
export const getBodyTypes = async (req, res) => {
  try {
    const bodyTypes = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('body_type')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Body types retrieved successfully',
      data: bodyTypes.filter(type => type),
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
 * Get all unique fuel types
 * @route GET /api/filters/fuel-types
 */
export const getFuelTypes = async (req, res) => {
  try {
    const fuelTypes = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('fuel_type')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Fuel types retrieved successfully',
      data: fuelTypes.filter(type => type),
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
    const cities = await CarPost.find({ isDeleted: false, verified: true })
      .distinct('dealer.city')
      .sort();

    res.status(200).json({
      success: true,
      message: 'Cities retrieved successfully',
      data: cities.filter(city => city),
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

    const [brands, years, bodyTypes, transmissions, fuelTypes, drivetrains, colors, cities, seats] = await Promise.all([
      CarPost.find(verified).distinct('make').sort(),
      CarPost.find(verified).distinct('year').sort({ $natural: -1 }),
      CarPost.find(verified).distinct('body_type').sort(),
      CarPost.find(verified).distinct('transmission').sort(),
      CarPost.find(verified).distinct('fuel_type').sort(),
      CarPost.find(verified).distinct('drivetrain').sort(),
      CarPost.find(verified).distinct('exterior_color').sort(),
      CarPost.find(verified).distinct('dealer.city').sort(),
      CarPost.find(verified).distinct('std_seating').sort(),
    ]);

    res.status(200).json({
      success: true,
      message: 'All filter options retrieved successfully',
      data: {
        brands: brands.filter(b => b),
        years: years.filter(y => y),
        bodyTypes: bodyTypes.filter(bt => bt),
        transmissions: transmissions.filter(t => t),
        fuelTypes: fuelTypes.filter(ft => ft),
        drivetrains: drivetrains.filter(dt => dt),
        colors: colors.filter(c => c),
        cities: cities.filter(c => c),
        seats: seats.filter(s => s),
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
