import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../lib/axios';
import CarHeroSection from '../components/cardetails/CarHeroSection';
import CarImageGallery from '../components/cardetails/CarImageGallery';
import CarPriceActions from '../components/cardetails/CarPriceActions';
import CarSpecifications from '../components/cardetails/CarSpecifications';
import DealerInfo from '../components/cardetails/DealerInfo';

const BoughtCarDetail = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [carData, setCarData] = useState(null);
  const [dealerData, setDealerData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('BoughtCarDetail - Starting to fetch data for car:', id);
        setLoading(true);
        setError(null);

        // Fetch car details
        const carResponse = await api.get(`/api/cars/${id}`);

        if (carResponse.data.success) {
          const car = carResponse.data.data;
          
          // Transform car data
          const transformedData = {
            name: car.heading,
            heroImage: car.photo_links && car.photo_links.length > 0 ? car.photo_links[0] : '',
            images: car.photo_links || [],
            price: `${car.price.toLocaleString()} vnd`,
            specifications: {
              leftColumn: [
                {
                  title: "Basic Car Details",
                  items: [
                    { label: "Year", value: car.year || 'N/A' },
                    { label: "Make", value: car.make || 'N/A' },
                    { label: "Model", value: car.model || 'N/A' },
                    { label: "Mileage", value: `${car.miles?.toLocaleString() || 'N/A'} mi` },
                    { label: "Fuel Type", value: car.fuel_type || 'N/A' },
                    { label: "Doors", value: car.doors ? `${car.doors} doors` : 'N/A' },
                  ]
                },
                {
                  title: "Body & Exterior Type",
                  items: [
                    { label: "Body Type", value: car.body_type || 'N/A' },
                    { label: "Drivetrain", value: car.drivetrain || 'N/A' },
                    { label: "Transmission", value: car.transmission || 'N/A' },
                    { label: "Trim", value: car.trim || 'N/A' },
                  ]
                },
                {
                  title: "Engine & Powertrain",
                  items: [
                    { label: "Engine", value: car.engine || 'N/A' },
                    { label: "Engine Size", value: car.engine_size ? `${car.engine_size} L` : 'N/A' },
                    { label: "Engine Block", value: car.engine_block || 'N/A' },
                    { label: "Cylinders", value: car.cylinders || 'N/A' },
                    { label: "Fuel Type", value: car.fuel_type || 'N/A' },
                    { label: "Vehicle Type", value: car.vehicle_type || 'N/A' },
                  ]
                },
                {
                  title: "Dimensions & Capacity",
                  items: [
                    { label: "Overall Height", value: car.overall_height ? `${car.overall_height} mm` : 'N/A' },
                    { label: "Overall Length", value: car.overall_length ? `${car.overall_length} mm` : 'N/A' },
                    { label: "Overall Width", value: car.overall_width ? `${car.overall_width} mm` : 'N/A' },
                    { label: "Seating Capacity", value: car.std_seating || 'N/A' },
                  ]
                }
              ],
              rightColumn: [
                {
                  title: "Drivetrain & Transmission",
                  items: [
                    { label: "Transmission", value: car.transmission || 'N/A' },
                    { label: "Drivetrain", value: car.drivetrain || 'N/A' },
                  ]
                },
                {
                  title: "Fuel Efficiency",
                  items: [
                    { label: "Highway MPG", value: car.highway_mpg ? `${car.highway_mpg} mpg` : 'N/A' },
                    { label: "City MPG", value: car.city_mpg ? `${car.city_mpg} mpg` : 'N/A' },
                  ]
                },
                {
                  title: "Exterior & Interior Color",
                  items: [
                    { label: "Exterior Color", value: car.exterior_color || 'N/A' },
                    { label: "Interior Color", value: car.interior_color || 'N/A' },
                    { label: "Base Exterior Color", value: car.base_ext_color || 'N/A' },
                    { label: "Base Interior Color", value: car.base_int_color || 'N/A' },
                  ]
                },
                {
                  title: "Vehicle History",
                  items: [
                    { label: "Inventory Type", value: car.inventory_type || 'N/A' },
                    { label: "Clean Title", value: car.carfax_clean_title ? 'Yes' : 'No' },
                    { label: "Status", value: car.status || 'N/A' },
                  ]
                }
              ]
            }
          };
          
          // Store dealer/seller info
          setDealerData({
            name: car.seller?.name || 'N/A',
            title: 'Car Seller',
            photo: null,
            phone: car.seller?.phone || 'N/A',
            email: car.seller?.email || 'N/A',
            location: car.dealer ? 
              `${car.dealer.street || ''}, ${car.dealer.city || ''}, ${car.dealer.state || ''}, ${car.dealer.country || ''}`.replace(/^, |, $/, '') : 
              'N/A'
          });
          
          setCarData(transformedData);
        }

        // Fetch order details using the order endpoint for this car
        try {
          const orderResponse = await api.get(`/api/orders/car/${id}`, {
            headers: {
              'Authorization': `Bearer ${auth?.accessToken}`
            }
          });

          console.log('Order response:', orderResponse.data);

          if (orderResponse.data.success && orderResponse.data.data) {
            const order = orderResponse.data.data;
            console.log('Order data loaded:', order);
            setOrderData(order);
            setOrderStatus(order.orderStatus || 'pending');
          } else {
            console.log('Order response not successful or no data:', orderResponse.data);
          }
        } catch (err) {
          console.log('Order fetch error:', err.response?.status, err.response?.data);
          // 404 is expected if no order found, log but don't break
          if (err.response?.status === 404) {
            console.log('No order found for this car (404)');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, auth]);

  const handleStatusUpdate = async (newStatus) => {
    if (!orderData || !orderData._id) {
      toast.error('Order data not available');
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await api.patch(
        `/api/orders/${orderData._id}/status`,
        { orderStatus: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${auth?.accessToken}`
          }
        }
      );

      if (response.data.success) {
        setOrderStatus(newStatus);
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading car details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!carData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Car not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <CarHeroSection carName={carData.name} heroImage={carData.images[selectedImageIndex]} />
      <CarImageGallery images={carData.images} selectedImage={selectedImageIndex} onImageSelect={setSelectedImageIndex} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CarSpecifications specifications={carData.specifications} />
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Dealer Info */}
              {dealerData && <DealerInfo dealer={dealerData} />}
              
              {/* Buyer Information */}
              {orderData && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Buyer Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-400">Name</p>
                      <p className="text-white font-semibold">{orderData.firstName} {orderData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="text-white font-semibold break-all">{orderData.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Phone</p>
                      <p className="text-white font-semibold">{orderData.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Location */}
              {orderData && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Shipping Location</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-400">Address</p>
                      <p className="text-white font-semibold">{orderData.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">City</p>
                        <p className="text-white font-semibold">{orderData.city}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">State</p>
                        <p className="text-white font-semibold">{orderData.state || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Country</p>
                        <p className="text-white font-semibold">{orderData.country}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">ZIP Code</p>
                        <p className="text-white font-semibold">{orderData.zipCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Status */}
              {orderData && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Delivery Status</h3>
                  <select
                    value={orderStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">In Transit</option>
                    <option value="delivered">Delivered to Owner</option>
                  </select>
                  {updatingStatus && <p className="text-gray-400 text-sm mt-2">Updating...</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoughtCarDetail;
