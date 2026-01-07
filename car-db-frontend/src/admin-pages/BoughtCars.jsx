import '../index.css';
import { useEffect, useState } from 'react';
import api from '../lib/axios';
import ProductCard from '../components/carlisting/ProductCard';
import Result from '../components/carlisting/Result';
import DeliveredFilter from '../components/admin/DeliveredFilter';
import { useAuth } from '../context/AuthContext';

function BoughtCars() {
  const { auth } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const limit = 12;

  // Map display status to API status values
  const statusMap = {
    'Processing': 'processing',
    'In Transit': 'shipped',
    'Delivered to Owner': 'delivered'
  };

  // Fetch sold cars from API
  useEffect(() => {
    const fetchSoldCars = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/cars/admin/all`, {
          params: { page: currentPage, limit, sold: 'true' },
          headers: {
            'Authorization': `Bearer ${auth?.accessToken}`
          }
        });

        if (response.data.success) {
          // Transform API response and fetch order status for each car
          let transformedCars = await Promise.all(
            response.data.data.map(async (car) => {
              let orderStatus = 'processing'; // default
              
              // Fetch order data to get actual delivery status
              try {
                const orderResponse = await api.get(`/api/orders/car/${car._id}`, {
                  headers: {
                    'Authorization': `Bearer ${auth?.accessToken}`
                  }
                });
                
                if (orderResponse.data.success && orderResponse.data.data) {
                  orderStatus = orderResponse.data.data.orderStatus || 'processing';
                }
              } catch (err) {
                console.debug(`Could not fetch order for car ${car._id}:`, err.response?.status);
              }

              return {
                id: car._id,
                to: `/bought-car/${car._id}`,
                img: car.photo_links?.[0] || 'https://via.placeholder.com/300x200?text=No+Image',
                statusLabel: car.status || 'Sold',
                name: `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim(),
                price: `${car.price?.toLocaleString('vi-VN') || 'N/A'} đ`,
                location: car.location || 'Vietnam',
                year: car.year,
                wheel: car.drivetrain || 'Unknown',
                fuel: car.fuel_type || 'Unknown',
                seats: car.seats || 5,
                delivered: 'Sold',
                createdAt: car.createdAt,
                orderStatus: orderStatus,
              };
            })
          );

          // Filter by selected delivery statuses if any are selected
          if (selectedStatuses.length > 0) {
            const statusValuesToFilter = selectedStatuses.map(s => statusMap[s]);
            transformedCars = transformedCars.filter(car => 
              statusValuesToFilter.includes(car.orderStatus)
            );
          }

          // Sort by createdAt
          transformedCars.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
          });

          setCars(transformedCars);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching sold cars:', err);
        setError('Failed to load sold cars');
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldCars();
  }, [currentPage, selectedStatuses, sortBy]);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
      {/* This wrapper controls the whole layout width */}
      <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
        <DeliveredFilter 
          onStatusChange={setSelectedStatuses}
          statusOptions={['Processing', 'In Transit', 'Delivered to Owner']}
        />

        {/* Right panel has custom width */}
        <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
          <Result 
            count={cars.length}
            onSortChange={setSortBy}
            sort={sortBy}
          />

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-400">Loading sold cars...</div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center py-20">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          {!loading && !error && cars.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-400">No sold cars found</div>
            </div>
          )}

          {!loading && !error && cars.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
                {cars.map(car => (
                  <ProductCard
                    key={car.id}
                    id={car.id}
                    to={car.to}
                    img={car.img}
                    status={car.statusLabel}
                    name={car.name}
                    price={car.price}
                    location={car.location}
                    year={car.year}
                    wheel={car.wheel}
                    fuel={car.fuel}
                    seats={car.seats}
                  >
                    <div className="w-full py-2 text-green-400 border border-green-400 rounded text-center">
                      Sold
                    </div>
                  </ProductCard>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BoughtCars;
