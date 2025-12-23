import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

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
          overall_height: 0, // Not available in current data
          overall_length: 0, // Not available in current data
          overall_width: 0, // Not available in current data
          std_seating: 0, // Not available in current data
          exterior_color: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Color')?.value || 'Unknown',
          interior_color: 'Unknown', // Not available in current data
          base_ext_color: 'Unknown', // Not available in current data
          base_int_color: 'Unknown', // Not available in current data
          vin: 'Unknown', // Not available in current data
          inventory_type: carData.specifications?.leftColumn?.[0]?.items?.find(item => item.label === 'Mileage')?.value === '0 mi' ? 'new' : 'used',
          owners: 0, // Not available in current data
          carfax_clean_title: 'Unknown', // Not available in current data
          phone: 'Unknown', // Not available in current data
          dealer: {
            street: 'Unknown', // Not available in current data
            city: 'Unknown', // Not available in current data
            state: 'Unknown', // Not available in current data
            country: 'Unknown', // Not available in current data
          },
        },
        imagePreviews: carData.images?.map(url => ({ url, name: 'car-image.jpg', file: null })) || [],
        isPurchase: true, // Flag to indicate this is a purchase, not a listing
      }
    });
  };

  const handleCompare = () => {
    // Get existing comparison list from localStorage
    const existingCompare = JSON.parse(localStorage.getItem('compareList') || '[]');
    
    // Check if car is already in the list
    const isAlreadyAdded = existingCompare.some(car => car.name === carData.name);
    
    if (isAlreadyAdded) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    
    if (existingCompare.length < 3) {
      // Add car to comparison list
      existingCompare.push(carData);
      localStorage.setItem('compareList', JSON.stringify(existingCompare));
    }
    
    // Redirect to compare page
    navigate('/compare');
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Approve
            </button>
            <button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Delete
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
