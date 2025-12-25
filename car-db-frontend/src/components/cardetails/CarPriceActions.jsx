import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const CarPriceActions = ({ price, carData, carId, onStatusChange, isUser, isAdminApproved, isAdminWaitlist, isAdminStatus }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(() => {
    try {
      const store = JSON.parse(localStorage.getItem('boughtCarsStatus') || '{}');
      return store?.[carId] || 'Not Delivered';
    } catch (e) {
      return 'Not Delivered';
    }
  });

  const handleBuy = () => {
    // If not authenticated, show a login notification
    if (!auth?.accessToken) {
      setShowLoginNotification(true);
      setTimeout(() => setShowLoginNotification(false), 3000);
      return;
    }
    // Navigate to order summary page with car data
    navigate('/order-summary', {
      state: {
        carData: {
          heading: carData.name,
          price: parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0,
          miles: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Mileage')?.value?.replace(' mi', '') || 0,
          condition: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Mileage')?.value === '0 mi' ? 'new' : 'used',
          vehicle_type: 'car', // Default value
          year: parseInt(carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Year')?.value) || 0,
          make: 'Unknown', // Would need to be extracted from car name or API
          model: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Model')?.value || 'Unknown',
          trim: 'Unknown', // Not available in current data
          made_in: 'Unknown', // Not available in current data
          body_type: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Body Type')?.value || 'Unknown',
          body_subtype: 'Unknown', // Not available in current data
          doors: parseInt(carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Doors')?.value) || 0,
          engine: 'Unknown', // Not available in current data
          engine_size: 0, // Not available in current data
          engine_block: 'Unknown', // Not available in current data
          cylinders: 0, // Not available in current data
          fuel_type: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Fuel Type')?.value || 'Unknown',
          transmission: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Transmission')?.value || 'Unknown',
          drivetrain: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Drivetrain')?.value || 'Unknown',
          highway_mpg: 0, // Not available in current data
          city_mpg: 0, // Not available in current data
          combined_mpg: 0, // Not available in current data
          exterior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Exterior Color')?.value || 'Unknown',
          interior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Interior Color')?.value || 'Unknown',
          base_exterior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Base Exterior Color')?.value || 'Unknown',
          base_interior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Base Interior Color')?.value || 'Unknown',
          previous_owners: parseInt(carData.specifications?.rightColumn?.[3]?.items?.find(item => item.label === 'Previous Owner')?.value) || 0,
          clean_title: carData.specifications?.rightColumn?.[3]?.items?.find(item => item.label === 'Clean Title')?.value === 'Yes',
          height: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Overall Height')?.value || 'Unknown',
          length: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Overall Length')?.value || 'Unknown',
          width: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Overall Width')?.value || 'Unknown',
          cargo_capacity: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Cargo Capacity')?.value || 'Unknown',
          powertrain_type: carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Powertrain Type')?.value || 'Unknown',
          engine_block: carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Engine Block')?.value || 'Unknown',
          cylinders: parseInt(carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Cylinders')?.value) || 0,
          engine_size: carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Engine Size')?.value || 'Unknown',
        }
      }
    });
  };

  const handleCompare = () => {
    const storedCars = JSON.parse(localStorage.getItem('compareCars') || '[]');
    const isAlreadyCompared = storedCars.some(car => car.id === carId);

    if (isAlreadyCompared) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    const carToCompare = {
      id: carId,
      name: carData.name,
      price: price,
      image: carData.images?.[0] || 'https://via.placeholder.com/400x300',
      year: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Year')?.value || 'Unknown',
      mileage: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Mileage')?.value || 'Unknown',
      fuel: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Fuel Type')?.value || 'Unknown',
      transmission: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Transmission')?.value || 'Unknown',
      drivetrain: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Drivetrain')?.value || 'Unknown',
    };

    storedCars.push(carToCompare);
    localStorage.setItem('compareCars', JSON.stringify(storedCars));
    navigate('/compare');
  };

  const handleApprove = async () => {
    try {
      await axios.patch(`/api/cars/admin/${carId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        },
        withCredentials: true
      });
      toast.success('Car approved successfully');
      // Navigate back to waitlist or refresh
      navigate('/admin/waitlist-cars');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve car');
    }
  };

  const handleReject = async () => {
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
      // Navigate back to waitlist or refresh
      navigate('/admin/waitlist-cars');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject car');
    }
  };

  return (
    <div className="container mx-auto px-4 pb-8 relative">
      {showNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg shadow-lg font-semibold animate-fade-in">
          You've chosen this car for comparison already
        </div>
      )}
      {showLoginNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold animate-fade-in">
          You need to login before buying.
          <button onClick={() => navigate('/login')} className="underline ml-2">Login</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400 mb-2">Price</p>
          <p className="text-3xl font-bold text-blue-500">{price}</p>
        </div>

        {isUser && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center gap-4">
            <button 
              onClick={handleBuy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Buy
            </button>
            <button 
              onClick={handleCompare}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Compare Car
            </button>
          </div>
        )}

        {isAdminApproved && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center gap-4">
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {isAdminWaitlist && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center gap-4">
            <button 
              onClick={handleApprove}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={handleReject}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Reject
            </button>
          </div>
        )}

        {isAdminStatus && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center gap-4">
            <select
              className="p-2 rounded border bg-white text-black"
              value={deliveryStatus}
              onChange={(e) => {
                const val = e.target.value;
                setDeliveryStatus(val);
                try {
                  const store = JSON.parse(localStorage.getItem('boughtCarsStatus') || '{}');
                  store[carId] = val;
                  localStorage.setItem('boughtCarsStatus', JSON.stringify(store));
                } catch (err) {
                  localStorage.setItem('boughtCarsStatus', JSON.stringify({ [carId]: val }));
                }
                if (typeof onStatusChange === 'function') onStatusChange(carId, val);
              }}
            >
              <option>Not Delivered</option>
              <option>Delivered</option>
            </select>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CarPriceActions;
