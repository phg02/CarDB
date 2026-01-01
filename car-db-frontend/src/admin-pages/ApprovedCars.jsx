import '../index.css';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProductCard from '../components/carlisting/ProductCard';
import Filter from '../components/carlisting/Filter';
import Result from '../components/carlisting/Result';
import { useAuth } from '../context/AuthContext';

function ApprovedCar() {
  const { auth } = useAuth();
  const [cars, setCars] = useState([]);
  const [displayCars, setDisplayCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const filterDebounceRef = useRef(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchApprovedCars = async (page = 1, filters = {}, options = { initial: false }) => {
    try {
      if (options.initial) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);
      const response = await axios.get('/api/cars/admin/all', {
        params: { page, limit: 12, verified: 'true', ...filters },
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        },
        withCredentials: true
      });
      const data = response.data.data || [];
      setCars(data);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch approved cars');
      toast.error('Failed to load approved cars');
    } finally {
      if (options.initial) {
        setLoading(false);
      } else {
        setIsFiltering(false);
      }
    }
  };

  // Apply sort whenever cars data or sortBy changes
  useEffect(() => {
    setDisplayCars(applySort(cars, sortBy));
  }, [cars, sortBy]);

  const applySort = (items, sortKey) => {
    if (!Array.isArray(items)) return items || [];
    const copy = [...items];
    const parsePrice = (p) => {
      if (p == null) return 0;
      if (typeof p === 'number') return p;
      const s = String(p).toLowerCase();

      const extractNumber = (str) => {
        const cleaned = String(str).replace(/[^0-9.,-]+/g, '').replace(/,/g, '');
        const digits = cleaned.replace(/\./g, '');
        const n = Number(digits || 0);
        return Number.isNaN(n) ? 0 : n;
      };

      if (s.includes('tri') || s.includes('triệu')) return extractNumber(s) * 1e6;
      if (s.includes('t') && (s.includes('ỷ') || s.includes('ty') || s.includes('tỷ'))) return extractNumber(s) * 1e9;

      const digits = s.replace(/\D+/g, '');
      const n = Number(digits || 0);
      return Number.isNaN(n) ? 0 : n;
    };
    switch (sortKey) {
      case 'price_low':
        return copy.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      case 'price_high':
        return copy.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
      case 'year_new':
        return copy.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'year_old':
        return copy.sort((a, b) => (a.year || 0) - (b.year || 0));
      default:
        // Return in original order for 'default' sort
        return copy;
    }
  };

  useEffect(() => {
    fetchApprovedCars(1, {}, { initial: true });
  }, []);

  const handleFilterChange = (filters, immediate = false) => {
    console.debug('ApprovedCars.handleFilterChange called', { filters, immediate, auth });
    if (!auth?.accessToken) {
      toast.error('You must be logged in as admin to apply filters');
      return;
    }
    // Map UI filter shape to API query params (same rules as CarListing)
    const PRICE_MIN = 0;
    const PRICE_MAX = 20000000000;
    const buildApiFilters = (selected) => {
      const api = {};
      if (!selected) return api;

      if (selected.statuses && selected.statuses.length === 1) api.status = selected.statuses[0].toLowerCase();

      if (selected.priceRange) {
        if (selected.priceRange.min > PRICE_MIN) api.minPrice = selected.priceRange.min;
        if (selected.priceRange.max < PRICE_MAX) api.maxPrice = selected.priceRange.max;
      }

      if (selected.brands && selected.brands.length > 0) api.make = selected.brands.join('|');
      if (selected.models && selected.models.length > 0) api.model = selected.models.join('|');
      if (selected.bodyTypes && selected.bodyTypes.length > 0) api.body_type = selected.bodyTypes.join('|');
      if (selected.transmissions && selected.transmissions.length > 0) api.transmission = selected.transmissions.join('|');
      if (selected.fuelTypes && selected.fuelTypes.length > 0) api.fuel_type = selected.fuelTypes.join('|');
      if (selected.drivetrains && selected.drivetrains.length > 0) api.drivetrain = selected.drivetrains.join('|');
      if (selected.colors && selected.colors.length > 0) api.exterior_color = selected.colors.join('|');
      if (selected.cities && selected.cities.length > 0) api.city = selected.cities.join('|');

      if (selected.years && selected.years.length === 1) api.year = selected.years[0];
      if (selected.seats && selected.seats.length === 1) api.seats = selected.seats[0];

      return api;
    };

    const apiFilters = buildApiFilters(filters);

    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    if (immediate) {
      console.debug('ApprovedCars: immediate filter apply', apiFilters);
      fetchApprovedCars(1, apiFilters);
      return;
    }

    setIsFiltering(true);
    filterDebounceRef.current = setTimeout(() => {
      console.debug('ApprovedCars: debounced filter apply', apiFilters);
      fetchApprovedCars(1, apiFilters);
      setIsFiltering(false);
    }, 300);
  };

  const handleSortChange = (value) => {
    const sorted = applySort(cars, value);
    setSortBy(value);
    setDisplayCars(sorted);
  };

  const handleDelete = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this approved car?')) {
      return;
    }

    try {
      await axios.delete(`/api/cars/${carId}`, {
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        },
        withCredentials: true
      });
      toast.success('Car deleted successfully');
      // Remove the car from the list
      const remaining = cars.filter(car => car._id !== carId);
      setCars(remaining);
      setDisplayCars(remaining);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete car');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <Filter onFilterChange={handleFilterChange} />
          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={0} />
            <div className="text-center text-white">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <Filter onFilterChange={handleFilterChange} />
          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={0} />
            <div className="text-center text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
      <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <Filter onFilterChange={handleFilterChange} />

          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={displayCars.length} onSortChange={handleSortChange} sort={sortBy} />

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              {displayCars.map((car) => (
                <ProductCard
                  key={car._id}
                  id={car._id}
                  to={`/approved-car/${car._id}`}
                  img={car.photo_links && car.photo_links.length > 0 ? car.photo_links[0] : 'https://via.placeholder.com/400x300'}
                  status={car.inventory_type === 'new' ? 'New' : 'Used'}
                  name={car.heading || `${car.make} ${car.model}`}
                  price={formatPrice(car.price)}
                  location={car.dealer ? `${car.dealer.city || ''}, ${car.dealer.state || ''}, ${car.dealer.country || ''}`.replace(/^, |, $/, '') : 'Location not specified'}
                  year={car.year}
                  wheel={car.drivetrain || 'Unknown'}
                  fuel={car.fuel_type || 'Unknown'}
                  seats={car.std_seating || 5}
                >
                  {car.sold ? (
                    <button
                      disabled
                      className="w-full py-2 text-green-400 border border-green-400 rounded bg-green-500/20 cursor-not-allowed"
                    >
                      ✓ SOLD
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(car._id)}
                      className="w-full py-2 text-red-400 border border-red-400 rounded hover:bg-red-500 hover:text-white transition"
                    >
                      Delete
                    </button>
                  )}
                </ProductCard>
              ))}
            </div>

            {displayCars.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No approved cars found
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default ApprovedCar;
