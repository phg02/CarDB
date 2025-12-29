import '../index.css';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import ProductCard from '../components/carlisting/ProductCard';
import Filter from '../components/carlisting/Filter';
import Result from '../components/carlisting/Result';
import { useAuth } from '../context/AuthContext';

function WaitlistCar() {
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

  const fetchUnverifiedCars = async (page = 1, filters = {}, options = { initial: false }) => {
    try {
      if (options.initial) setLoading(true);
      else setIsFiltering(true);
      setError(null);

      // Fetch unverified (paid) posts for waitlist
      const response = await axios.get('/api/cars/admin/unverified', {
        params: { page, limit: 12 },
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        },
        withCredentials: true
      });

      const data = response.data.data || [];
      setCars(data);
      setDisplayCars(applySort(data, sortBy));
      setTotalPages(response.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch unverified cars');
      toast.error('Failed to load unverified cars');
    } finally {
      if (options.initial) setLoading(false);
      else setIsFiltering(false);
    }
  };

  const handleSortChange = (value) => {
    const sorted = applySort(cars, value);
    setSortBy(value);
    setDisplayCars(sorted);
  };

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
        return copy;
    }
  };

  useEffect(() => {
    fetchUnverifiedCars(1, {}, { initial: true });
  }, []);

  const handleApprove = async (carId) => {
    try {
      await axios.patch(`/api/cars/admin/${carId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        },
        withCredentials: true
      });
      toast.success('Car approved successfully');
      // Remove the car from the list
      const remaining = cars.filter(car => car._id !== carId);
      setCars(remaining);
      setDisplayCars(remaining);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve car');
    }
  };

  const handleReject = async (carId) => {
    try {
      await axios.patch(`/api/cars/admin/${carId}/reject`, {
        reason: 'Rejected by admin'
      }, {
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        },
        withCredentials: true
      });
      toast.success('Car rejected successfully');
      // Remove the car from the list
      const remaining = cars.filter(car => car._id !== carId);
      setCars(remaining);
      setDisplayCars(remaining);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject car');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleFilterChange = (filters, immediate = false) => {
    if (!auth?.accessToken) {
      toast.error('You must be logged in as admin to apply filters');
      return;
    }

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

    const applyFilters = async () => {
      try {
        setIsFiltering(true);
        const response = await axios.get('/api/cars/admin/unverified', {
          params: { page: 1, limit: 1000 },
          headers: { 'Authorization': `Bearer ${auth?.accessToken}` },
          withCredentials: true
        });

        const raw = response.data.data || [];

        const filtered = raw.filter(car => {
          // Price
          if (apiFilters.minPrice && car.price < apiFilters.minPrice) return false;
          if (apiFilters.maxPrice && car.price > apiFilters.maxPrice) return false;

          // Status
          if (apiFilters.status && car.inventory_type !== apiFilters.status) return false;

          // Make / model / body / transmission / fuel / drivetrain / color / city
          if (apiFilters.make) {
            const pattern = new RegExp(apiFilters.make.split('|').join('|'), 'i');
            if (!pattern.test(car.make || '')) return false;
          }
          if (apiFilters.model) {
            const pattern = new RegExp(apiFilters.model.split('|').join('|'), 'i');
            if (!pattern.test(car.model || '')) return false;
          }
          if (apiFilters.body_type && !new RegExp(apiFilters.body_type.split('|').join('|'), 'i').test(car.body_type || '')) return false;
          if (apiFilters.transmission && !new RegExp(apiFilters.transmission.split('|').join('|'), 'i').test(car.transmission || '')) return false;
          if (apiFilters.fuel_type && !new RegExp(apiFilters.fuel_type.split('|').join('|'), 'i').test(car.fuel_type || '')) return false;
          if (apiFilters.drivetrain && !new RegExp(apiFilters.drivetrain.split('|').join('|'), 'i').test(car.drivetrain || '')) return false;
          if (apiFilters.exterior_color && !new RegExp(apiFilters.exterior_color.split('|').join('|'), 'i').test(car.exterior_color || '')) return false;
          if (apiFilters.city && !new RegExp(apiFilters.city.split('|').join('|'), 'i').test(car.dealer?.city || '')) return false;

          if (apiFilters.year && parseInt(car.year) !== parseInt(apiFilters.year)) return false;
          if (apiFilters.seats && car.std_seating && parseInt(car.std_seating) !== parseInt(apiFilters.seats)) return false;

          return true;
        });

        setCars(raw);
        setDisplayCars(applySort(filtered, sortBy));
      } catch (err) {
        console.error('Error applying filters to waitlist:', err);
        toast.error('Failed to apply filters');
      } finally {
        setIsFiltering(false);
      }
    };

    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    if (immediate) {
      applyFilters();
      return;
    }

    setIsFiltering(true);
    filterDebounceRef.current = setTimeout(() => {
      applyFilters();
    }, 300);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
        <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <Filter onFilterChange={handleFilterChange} apiParams={{ verified: 'false' }} />
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
          <Filter onFilterChange={handleFilterChange} apiParams={{ verified: 'false' }} />
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
          <Filter onFilterChange={handleFilterChange} apiParams={{ verified: 'false' }} />

          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={displayCars.length} onSortChange={handleSortChange} sort={sortBy} />

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              {displayCars.map((car) => (
                <ProductCard
                  key={car._id}
                  id={car._id}
                  to={`/waitlist-car/${car._id}`}
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
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleApprove(car._id)}
                      className="w-1/2 py-2 text-blue-400 border border-blue-400 rounded hover:bg-blue-500 hover:text-white transition text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(car._id)}
                      className="w-1/2 py-2 text-red-400 border border-red-400 rounded hover:bg-red-500 hover:text-white transition text-center"
                    >
                      Reject
                    </button>
                  </div>
                </ProductCard>
              ))}
            </div>

            {displayCars.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No unverified cars found
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

export default WaitlistCar;
