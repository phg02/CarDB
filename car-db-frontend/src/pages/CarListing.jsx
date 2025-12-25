import '../index.css';
import { useState, useEffect } from 'react';
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

  const fetchCars = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/cars', {
        params: { page, limit: 12, ...filters }
      });
      setCars(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cars');
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

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
          <Filter />
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
          <Filter />
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
          <Filter />

          {/* Right panel has custom width */}
          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={cars.length} />

            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              {cars.map((car) => (
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
                />
              ))}
            </div>

            {cars.length === 0 && (
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
