import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../carlisting/ProductCard';
import { api } from '../../lib/utils';

const MyListedCar = () => {
  const [listedCars, setListedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const { auth, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log('MyListedCar - useEffect triggered, authLoading:', authLoading, 'auth:', auth ? 'present' : 'null');
    if (!authLoading) {
      fetchListedCars(1); // Start with page 1
    }
  }, [auth, authLoading]);

  const fetchListedCars = async (page = 1) => {
    console.log('MyListedCar - fetchListedCars called, authLoading:', authLoading, 'auth token:', auth?.accessToken ? 'present' : 'missing');
    try {
      if (authLoading) {
        console.log('MyListedCar - Still loading auth, skipping fetch');
        // Still loading auth, don't fetch yet
        return;
      }

      if (!auth?.accessToken) {
        console.log('MyListedCar - No auth token, setting error');
        setError('Please login to view your listed cars');
        setLoading(false);
        return;
      }

      console.log('MyListedCar - Making API call to fetch cars');
      const response = await api.get(`/cars/seller?page=${page}&limit=12`, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`,
        },
      });

      console.log('MyListedCar - API call successful, cars:', response.data?.data?.length || 0);
      setListedCars(response.data?.data || []);
      setPagination(response.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      });
    } catch (err) {
      console.log('MyListedCar - Error fetching cars:', err.message);
      setError(err.message);
      console.error('Error fetching listed cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && !loading) {
      setLoading(true);
      fetchListedCars(newPage);
    }
  };

  const handlePayNow = async (carPost) => {
    try {
      console.log('Pay Now clicked for car post:', carPost);
      if (!auth?.accessToken) {
        toast.error('Please login to proceed with payment');
        return;
      }

      if (!carPost.postingFee) {
        toast.error('Payment information not found for this post');
        return;
      }

      console.log('Calling payment API with postingFeeId:', carPost.postingFee._id);

      // Initiate VNPay payment for the existing posting fee
      const paymentResponse = await api.post('/posting-fee/pay/checkout', {
        postingFeeId: carPost.postingFee._id,
      }, {
        headers: {
          "Authorization": `Bearer ${auth.accessToken}`,
        },
      });

      console.log('Payment initiated successfully:', paymentResponse.data);
      console.log('Payment API success:', paymentResponse.data);
      console.log('Payment result:', paymentResponse.data);

      if (!paymentResponse.data.data || !paymentResponse.data.data.url) {
        throw new Error('Invalid payment response - no payment URL received');
      }

      // Redirect to VNPay payment URL
      window.location.href = paymentResponse.data.data.url;

    } catch (err) {
      console.error('Error initiating payment:', err);
      toast.error(err.message || 'Failed to initiate payment');
    }
  };

  const formatCarData = (item) => {
    // All items are now car posts
    let status = 'Pending Approval';
    if (item.approvedBy) {
      status = 'Active';
    }
    if (item.paymentStatus === 'pending' || item.paymentStatus === 'failed') {
      status = 'Pending Payment';
    }

    return {
      id: item._id,
      name: item.heading,
      price: `${item.price.toLocaleString()} đ`,
      img: item.photo_links && item.photo_links.length > 0 ? item.photo_links[0] : '/placeholder-car.jpg',
      status: status,
      location: item.dealer ? `${item.dealer.city}, ${item.dealer.state}` : 'Location not specified',
      year: item.year || 'N/A',
      wheel: item.drivetrain || 'N/A',
      fuel: item.fuel_type || 'N/A',
      seats: item.seats || 'N/A',
      verified: item.verified,
      postingFee: item.postingFee, // Keep posting fee data for payment
      carPost: item // Keep original data
    };
  };

  if (authLoading || loading) {
    return (
      <div>
        <h2 className="text-white text-2xl font-semibold mb-6">My Listed Cars</h2>
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Loading your listed cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-white text-2xl font-semibold mb-6">My Listed Cars</h2>
        <div className="text-center py-16">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
<h2 className="text-white text-2xl font-semibold mb-6">My Listed Cars</h2>

      {listedCars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">You haven't listed any cars for sale yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listedCars.map(car => {
            const formattedCar = formatCarData(car);
            return (
              <div key={car._id} className="relative">
                <ProductCard {...formattedCar} />
                {formattedCar.status === 'Pending Payment' && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => handlePayNow(car)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Pay Now ({car.postingFee ? car.postingFee.amount.toLocaleString() : '15,000'} đ)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                pageNum === pagination.currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Show total count */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Showing {listedCars.length} of {pagination.totalItems} listed cars
      </div>
    </div>
  );
};

export default MyListedCar;
