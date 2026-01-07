import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-toastify';
import PurchaseHistoryCard from './PurchaseHistoryCard';

const PurchaseHistory = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCustomerOrders();
  }, [currentPage]);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/customer', {
        params: { page: currentPage, limit: 9 },
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      });

      if (response.data.success) {
        const formattedOrders = response.data.data.orders.map(order => {
          // Extract car details from items
          const carItem = order.items[0]; // Taking first item (single car orders)
          if (!carItem || !carItem.carPost) return null;

          const car = carItem.carPost;
          return {
            id: car._id,
            name: car.heading || car.title || `${car.make} ${car.model}`,
            price: carItem.price,
            year: car.year,
            status: order.orderStatus || 'pending',
            purchaseDate: new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            location: `${order.city}, ${order.country}`,
            carPostId: car._id,
            orderId: order._id,
            // Additional fields for ProductCard
            img: car.photo_links && car.photo_links[0] ? car.photo_links[0] : 'https://via.placeholder.com/300x200?text=Car+Image',
            wheel: car.drivetrain || 'N/A',
            fuel: car.fuel_type || 'N/A',
            seats: car.std_seating || 'N/A',
            body_type: car.body_type || 'N/A',
            transmission: car.transmission || 'N/A',
            engine_size: car.engine_size || 'N/A',
            overall_length: car.overall_length,
            overall_width: car.overall_width,
            overall_height: car.overall_height,
            carfax_clean_title: car.carfax_clean_title,
            inventory_type: car.inventory_type,
            photo_links: car.photo_links || [],
          };
        }).filter(car => car !== null);

        setOrders(formattedOrders);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter(car => car.orderId !== orderId));
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Loading your purchase history...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white text-2xl font-semibold mb-6">Purchase History</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">You haven't purchased any cars yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(car => (
              <PurchaseHistoryCard key={car.id} car={car} onDelete={handleDeleteOrder} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-[3px] disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-[3px] ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-[3px] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PurchaseHistory;
