import { Heart, Eye, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const PurchaseHistoryCard = ({ car, onDelete }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        if (auth?.accessToken) {
          const res = await axios.get('/api/cars/watchlist', {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
          });
          const list = res.data?.data?.watchlist || [];
          const ids = list.map(c => c._id || c.id || c);
          setIsWishlisted(ids.includes(car.id));
        }
      } catch (err) {
        console.debug('Could not fetch wishlist');
      }
    };
    checkWishlist();
  }, [car.id, auth]);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!auth?.accessToken) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await axios.delete(`/api/cars/watchlist/${car.id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
      } else {
        await axios.post(
          `/api/cars/watchlist/${car.id}`,
          {},
          {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
          }
        );
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error('Wishlist action failed:', err);
    }
  };

  const handleViewDetails = () => {
    navigate(`/car/${car.carPostId}`, {
      state: {
        purchaseInfo: {
          orderId: car.orderId,
          status: car.status,
          purchaseDate: car.status
        }
      }
    });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    // Prevent cancellation if order is in transit or delivered
    if (car.status === 'shipped' || car.status === 'delivered') {
      toast.error('This order cannot be cancelled as it is already in transit or has been delivered');
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/api/orders/${car.orderId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
      });
      toast.success('Purchase history deleted successfully');
      if (onDelete) {
        onDelete(car.orderId);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      
      // Handle specific error messages from backend
      if (err.response?.status === 400 && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete purchase history');
      }
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-gray-900 rounded-[3px] overflow-hidden group relative hover:shadow-xl transition-shadow duration-300">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-800 overflow-hidden">
        <img
          src={car.img}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Car+Image';
          }}
        />
        
        {/* Purchase Status Badge */}
        <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-[3px] text-xs font-semibold">
          ✓ Purchased
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4">
        {/* Price */}
        <p className="text-blue-400 text-lg font-bold mb-2">
          VND {car.price?.toLocaleString()}
        </p>

        {/* Title */}
        <h3 className="text-white text-lg font-semibold mb-1 truncate">{car.name}</h3>

        {/* Location and Delivery Status */}
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-400">{car.location}</p>
          
          {/* Delivery Status Badge */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Delivery Status:</p>
            <span className={`inline-block px-3 py-1.5 rounded-[3px] text-xs font-semibold text-white ${
              car.status === 'processing' ? 'bg-blue-600' :
              car.status === 'shipped' ? 'bg-orange-600' :
              car.status === 'delivered' ? 'bg-green-600' :
              'bg-gray-600'
            }`}>
              {car.status === 'processing' ? 'Processing' :
               car.status === 'shipped' ? 'In Transit' :
               car.status === 'delivered' ? 'Delivered to Owner' :
               car.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Specs */}
        <ul className="mt-3 flex items-center gap-2 flex-wrap mb-4">
          {car.year && (
            <li className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 20 20">
                <path
                  fill="currentColor"
                  d="M6 1a1 1 0 0 0-2 0h2ZM4 4a1 1 0 0 0 2 0H4Zm7-3a1 1 0 1 0-2 0h2ZM9 4a1 1 0 1 0 2 0H9Zm7-3a1 1 0 1 0-2 0h2Zm-2 3a1 1 0 1 0 2 0h-2ZM1 6a1 1 0 0 0 0 2V6Zm18 2a1 1 0 1 0 0-2v2ZM5 11v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 11v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 15v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 15v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 11v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM5 15v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM2 4h16V2H2v2Zm16 0h2a2 2 0 0 0-2-2v2Zm0 0v14h2V4h-2Zm0 14v2a2 2 0 0 0 2-2h-2Zm0 0H2v2h16v-2ZM2 18H0a2 2 0 0 0 2 2v-2Zm0 0V4H0v14h2ZM2 4V2a2 2 0 0 0-2 2h2Zm2-3v3h2V1H4Zm5 0v3h2V1H9Zm5 0v3h2V1h-2Z"
                />
              </svg>
              <p className="text-sm text-white">{car.year}</p>
            </li>
          )}

          {car.fuel && car.fuel !== 'N/A' && (
            <li className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 22 22">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              <p className="text-sm text-white">{car.fuel}</p>
            </li>
          )}

          {car.wheel && car.wheel !== 'N/A' && (
            <li className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 22 22">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"
                />
              </svg>
              <p className="text-sm text-white truncate">{car.wheel}</p>
            </li>
          )}

          {car.seats && car.seats !== 'N/A' && (
            <li className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 22 22">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              <p className="text-sm text-white">{car.seats}</p>
            </li>
          )}
        </ul>

        {/* View Details Button */}
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] transition-colors font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || car.status === 'shipped' || car.status === 'delivered'}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[3px] transition-colors font-medium"
            title={car.status === 'shipped' || car.status === 'delivered' ? 'Cannot cancel orders in transit or delivered' : 'Delete purchase history'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-[3px] shadow-xl max-w-sm w-full border border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Cancel This Purchase?</h3>
              <div className="space-y-3 mb-6">
                <p className="text-gray-400 text-sm">
                  Are you sure you want to cancel this purchase?
                </p>
                <p className="text-gray-500 text-xs bg-gray-900 p-3 rounded border border-gray-700">
                  Note: Your refund will be handled by our customer service team externally. Please contact support for more details.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-[3px] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-[3px] transition-colors font-medium"
                >
                  {deleting ? 'Cancelling...' : 'Cancel Purchase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryCard;
