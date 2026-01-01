import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const CarPriceActions = ({ price, carData, carId, onStatusChange, isUser, isAdminApproved, isAdminWaitlist, isAdminStatus, isPurchased, purchaseInfo, isOwnCar, isSold, soldDate }) => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [showNotification, setShowNotification] = useState('');
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
    
    // Extract mileage value safely
    const mileageStr = carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Mileage')?.value || '0';
    const milesValue = mileageStr ? parseInt(mileageStr.replace(/[^\d]/g, '')) : 0;
    
    // Navigate to order form page with car data
    navigate('/order', {
      state: {
        carData: {
          _id: carId,
          id: carId,
          name: carData.name,
          heading: carData.name,
          price: parseFloat(price.replace(/[^0-9.-]+/g, '')) || 0,
          miles: milesValue,
          condition: milesValue === 0 ? 'new' : 'used',
          vehicle_type: 'car',
          year: parseInt(carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Year')?.value) || 0,
          make: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Make')?.value || 'Unknown',
          model: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Model')?.value || 'Unknown',
          trim: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Trim')?.value || 'Unknown',
          made_in: 'Unknown',
          body_type: carData.specifications?.leftColumn?.[1]?.items?.find(item => item.label === 'Body Type')?.value || 'Unknown',
          body_subtype: 'Unknown',
          doors: parseInt(carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Doors')?.value?.replace(' doors', '')) || 0,
          engine: carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Engine')?.value || 'Unknown',
          fuel_type: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Fuel Type')?.value || 'Unknown',
          transmission: carData.specifications?.rightColumn?.[0]?.items?.find(item => item.label === 'Transmission')?.value || 'Unknown',
          drivetrain: carData.specifications?.rightColumn?.[0]?.items?.find(item => item.label === 'Drivetrain')?.value || 'Unknown',
          highway_mpg: parseInt(carData.specifications?.rightColumn?.[1]?.items?.find(item => item.label === 'Highway MPG')?.value?.replace(' mpg', '')) || 0,
          city_mpg: parseInt(carData.specifications?.rightColumn?.[1]?.items?.find(item => item.label === 'City MPG')?.value?.replace(' mpg', '')) || 0,
          combined_mpg: 0,
          exterior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Exterior Color')?.value || 'Unknown',
          interior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Interior Color')?.value || 'Unknown',
          base_exterior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Base Exterior Color')?.value || 'Unknown',
          base_interior_color: carData.specifications?.rightColumn?.[2]?.items?.find(item => item.label === 'Base Interior Color')?.value || 'Unknown',
          previous_owners: 0,
          clean_title: carData.specifications?.rightColumn?.[3]?.items?.find(item => item.label === 'Clean Title')?.value === 'Yes',
          height: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Overall Height')?.value || 'Unknown',
          length: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Overall Length')?.value || 'Unknown',
          width: carData.specifications?.leftColumn?.[3]?.items?.find(item => item.label === 'Overall Width')?.value || 'Unknown',
          cargo_capacity: 'Unknown',
          powertrain_type: 'Unknown',
          cylinders: parseInt(carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Cylinders')?.value) || 0,
          engine_size: carData.specifications?.leftColumn?.[2]?.items?.find(item => item.label === 'Engine Size')?.value?.replace(' L', '') || 'Unknown',
        }
      }
    });
  };

  const handleCompare = () => {
    let storedCars;
    try {
      storedCars = JSON.parse(localStorage.getItem('compareList') || '[]');
      if (!Array.isArray(storedCars)) storedCars = [];
    } catch (e) {
      storedCars = [];
    }

    if (storedCars.length >= 3) {
      setShowNotification("You've already compared 3 cars");
      setTimeout(() => setShowNotification(''), 3000);
      return;
    }

    const storedIds = storedCars.map(c => String(c.id ?? c.carId ?? c._id ?? '')).filter(Boolean);
    const normalizedCarId = String(carId ?? '');

    if (storedIds.includes(normalizedCarId)) {
      setShowNotification("You've chosen this car for comparison already");
      setTimeout(() => setShowNotification(''), 3000);
      return;
    }

    const carToCompare = {
      id: carId,
      name: carData?.name || '',
      heroImage: carData?.heroImage || carData?.images?.[0] || 'https://via.placeholder.com/400x300',
      price: price,
      dealer: { location: carData?.dealer?.location || '' },
      specifications: carData?.specifications || {
        leftColumn: [
          {
            items: [
              { label: 'Year', value: carData?.specifications?.leftColumn?.[0]?.items?.find?.(item => item.label === 'Year')?.value || (carData?.year ?? 'Unknown') },
              { label: 'Body Type', value: 'Unknown' },
              { label: 'Color', value: carData?.exterior_color || 'Unknown' },
              { label: 'Doors', value: (carData?.doors ?? 'N/A') },
              { label: 'Fuel Type', value: carData?.fuel || carData?.fuel_type || 'Unknown' }
            ]
          },
          {
            items: [
              { label: 'Roof Type', value: 'Unknown' },
              { label: 'Drivetrain', value: carData?.drivetrain || carData?.wheel || 'Unknown' },
              { label: 'Seats', value: carData?.seats || 'Unknown' },
              { label: 'Transmission', value: carData?.transmission || 'Unknown' }
            ]
          },
          {
            items: [
              { label: 'Engine Type', value: 'Unknown' },
              { label: 'Horsepower', value: 'N/A' },
              { label: 'Torque', value: 'N/A' }
            ]
          },
          {
            items: [
              { label: 'Length', value: 'N/A' },
              { label: 'Width', value: 'N/A' },
              { label: 'Height', value: 'N/A' }
            ]
          }
        ]
      },
      images: carData?.images && carData.images.length ? carData.images : [carData?.heroImage || 'https://via.placeholder.com/400x300']
    };

    storedCars.push(carToCompare);
    localStorage.setItem('compareList', JSON.stringify(storedCars));
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
          {showNotification}
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

        {isUser && !isPurchased && !isOwnCar && !isSold && (
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

        {isOwnCar && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-blue-400 mb-2 font-semibold">✓ YOUR LISTING</p>
              <p className="text-lg text-white font-semibold">This is your car listing</p>
              <p className="text-xs text-gray-400 mt-2">You cannot purchase your own car</p>
            </div>
          </div>
        )}

        {isSold && !isPurchased && !isAdminApproved && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-green-400 mb-2 font-semibold">✓ SOLD</p>
              <p className="text-lg text-white font-semibold">Sold on {soldDate}</p>
              <p className="text-xs text-gray-400 mt-2">This car has been sold</p>
            </div>
          </div>
        )}

        {isPurchased && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-green-400 mb-2 font-semibold">✓ PURCHASED</p>
              <p className="text-lg text-white font-semibold">{purchaseInfo?.purchaseDate}</p>
              <p className="text-xs text-gray-400 mt-2">Order ID: {purchaseInfo?.orderId}</p>
            </div>
          </div>
        )}

        {isAdminApproved && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center gap-4">
            {isSold || carData?.sold ? (
              <button
                disabled
                className="flex-1 bg-green-600 text-white font-semibold px-8 py-3 rounded-lg cursor-not-allowed opacity-75"
              >
                ✓ SOLD
              </button>
            ) : (
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
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
