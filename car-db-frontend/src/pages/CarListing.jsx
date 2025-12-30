import '../index.css';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProductCard from '../components/carlisting/ProductCard';
import Filter from '../components/carlisting/Filter';
import Result from '../components/carlisting/Result';
import { Link } from 'react-router-dom';

function CarListing() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayCars, setDisplayCars] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const filterDebounceRef = useRef(null);
  const [sortBy, setSortBy] = useState('default');
  const PRICE_MIN = 0;
  const PRICE_MAX = 20000000000;

  const fetchCars = async (page = 1, filters = {}, options = { initial: false }) => {
    try {
      if (options.initial) {
        setLoading(true);
      } else {
        setIsFiltering(true);
      }
      setError(null);
      const response = await axios.get('/api/cars', {
        params: { page, limit: 12, ...filters }
      });
      const data = response.data.data || [];
      setCars(data);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cars');
      toast.error('Failed to load cars');
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

      // Helper to extract numeric portion (handles dots/commas)
      const extractNumber = (str) => {
        const cleaned = String(str).replace(/[^0-9.,-]+/g, '').replace(/,/g, '');
        // Remove dots used as thousand separators, but keep digits
        const digits = cleaned.replace(/\./g, '');
        const n = Number(digits || 0);
        return Number.isNaN(n) ? 0 : n;
      };

      if (s.includes('tri') || s.includes('triệu')) {
        // e.g. "836 triệu" => 836 * 1e6
        return extractNumber(s) * 1e6;
      }
      if (s.includes('t') && (s.includes('ỷ') || s.includes('ty') || s.includes('tỷ'))) {
        // handle 'tỷ' or 'ty'
        return extractNumber(s) * 1e9;
      }

      // Fallback: strip non-digits
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
    fetchCars(1, {}, { initial: true });
  }, []);

  // Clear debounce on unmount
  useEffect(() => {
    return () => {
      if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    };
  }, []);

  const handleFilterChange = (filters, immediate = false) => {
    console.debug('CarListing.handleFilterChange', { filters, immediate });
    // Map UI filter shape to API query params
    const buildApiFilters = (selected) => {
      const api = {};
      if (!selected) return api;

      // Status: backend expects `status` param (single). If multiple selected,
      // we skip applying a status filter (equivalent to selecting all).
      if (selected.statuses && selected.statuses.length === 1) {
        api.status = selected.statuses[0].toLowerCase();
      }

      if (selected.priceRange) {
        if (selected.priceRange.min > PRICE_MIN) api.minPrice = selected.priceRange.min;
        if (selected.priceRange.max < PRICE_MAX) api.maxPrice = selected.priceRange.max;
      }

      // Backend uses regex for these fields, so join multiple selections with | to form an OR regex
      if (selected.brands && selected.brands.length > 0) api.make = selected.brands.join('|');
      if (selected.models && selected.models.length > 0) api.model = selected.models.join('|');
      if (selected.bodyTypes && selected.bodyTypes.length > 0) api.body_type = selected.bodyTypes.join('|');
      if (selected.transmissions && selected.transmissions.length > 0) api.transmission = selected.transmissions.join('|');
      if (selected.fuelTypes && selected.fuelTypes.length > 0) api.fuel_type = selected.fuelTypes.join('|');
      if (selected.drivetrains && selected.drivetrains.length > 0) api.drivetrain = selected.drivetrains.join('|');
      if (selected.colors && selected.colors.length > 0) api.exterior_color = selected.colors.join('|');
      if (selected.cities && selected.cities.length > 0) api.city = selected.cities.join('|');

      // Year and seats: backend expects single values; if multiple selected, skip filter
      if (selected.years && selected.years.length === 1) api.year = selected.years[0];
      if (selected.seats && selected.seats.length === 1) api.seats = selected.seats[0];

      return api;
    };

    const apiFilters = buildApiFilters(filters);

    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    if (immediate) {
      fetchCars(1, apiFilters, { initial: false });
      return;
    }

    filterDebounceRef.current = setTimeout(() => {
      fetchCars(1, apiFilters, { initial: false });
    }, 300);
  };

  const handleSortChange = (value) => {
    // Use authoritative `cars` array to compute sorted results so
    // initial clicks always sort the full dataset rather than a
    // possibly already-filtered/partial `displayCars` slice.
    const sorted = applySort(cars, value);
    setSortBy(value);
    setDisplayCars(sorted);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 w-full max-w-[1200px] mb-6 pr-4">
          <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
          <span>/</span>
          <span className="text-white">Car Listing</span>
        </nav>

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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 w-full max-w-[1200px] mb-6 pr-4">
          <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
          <span>/</span>
          <span className="text-white">Car Listing</span>
        </nav>

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 w-full max-w-[1200px] mb-6 pr-4">
        <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
        <span>/</span>
        <span className="text-white">Car Listing</span>
      </nav>

      {/* This wrapper controls the whole layout width */}
      <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <Filter onFilterChange={handleFilterChange} />

          {/* Right panel has custom width */}
          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={displayCars.length} onSortChange={handleSortChange} sort={sortBy} />

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              {displayCars.map((car) => (
                <ProductCard
                  key={car._id}
                  id={car._id}
                  to={`/car/${car._id}`}
                  img={car.photo_links && car.photo_links.length > 0 ? car.photo_links[0] : 'https://via.placeholder.com/400x300'}
                  status={car.inventory_type === 'new' ? 'New' : 'Used'}
                  name={car.heading || `${car.make} ${car.model}`}
                  price={formatPrice(car.price)}
                  location={car.dealer ? `${car.dealer.city || ''}, ${car.dealer.state || ''}, ${car.dealer.country || ''}`.replace(/^, |, $/, '') : 'Location not specified'}
                  year={car.year}
                  wheel={car.drivetrain || 'Unknown'}
                  fuel={car.fuel_type || 'Unknown'}
                  seats={car.std_seating || 5}
                  overall_length={car.overall_length}
                  overall_width={car.overall_width}
                  overall_height={car.overall_height}
                  std_seating={car.std_seating}
                  photo_links={car.photo_links}
                  engine={car.engine}
                  engine_size={car.engine_size}
                  engine_block={car.engine_block}
                  cylinders={car.cylinders}
                  doors={car.doors}
                  vehicle_type={car.vehicle_type}
                  body_type={car.body_type}
                  exterior_color={car.exterior_color}
                  transmission={car.transmission}
                  highway_mpg={car.highway_mpg}
                  city_mpg={car.city_mpg}
                  interior_color={car.interior_color}
                  carfax_clean_title={car.carfax_clean_title}
                  inventory_type={car.inventory_type}
                />
              ))}
            </div>

            {displayCars.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No cars found
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default CarListing;
