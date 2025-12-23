function sanitizeFilters(filters) {
  const valid = { 
    isDeleted: false, 
    verified: true,
    paymentStatus: 'paid'
  };

  if (!filters) return valid;

  if (filters.minSeats && !isNaN(filters.minSeats)) {
    valid.std_seating = { $gte: Number(filters.minSeats) };
  }

  if (filters.minMPG && !isNaN(filters.minMPG)) {
    valid.$or = [
      { highway_mpg: { $gte: Number(filters.minMPG) } },
      { city_mpg: { $gte: Number(filters.minMPG) } }
    ];
  }

  return valid;
}

const testFilters = {
    "body_type": null,
    "fuel_type": null,
    "transmission": null,
    "make": null,
    "model": null,
    "year": null,
    "maxPrice": null,
    "minPrice": null,
    "city": null,
    "minSeats": 5,
    "minMPG": null
};

console.log(sanitizeFilters(testFilters));
