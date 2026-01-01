import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CarHeroSection from '../components/cardetails/CarHeroSection';
import CarImageGallery from '../components/cardetails/CarImageGallery';
import CarPriceActions from '../components/cardetails/CarPriceActions';
import CarSpecifications from '../components/cardetails/CarSpecifications';
import DealerInfo from '../components/cardetails/DealerInfo';
import axios from 'axios';

const ApprovedCarDetail = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [carData, setCarData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/cars/${id}`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          const car = response.data.data;
          
          // Transform API data to match component expectations
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
            },
            dealer: {
              name: car.seller?.name || 'N/A',
              title: 'Car Seller',
              photo: null,
              phone: car.seller?.phone || 'N/A',
              email: car.seller?.email || 'N/A',
              location: car.dealer ? 
                `${car.dealer.street || ''}, ${car.dealer.city || ''}, ${car.dealer.state || ''}, ${car.dealer.country || ''}`.replace(/^, |, $/, '') : 
                'N/A'
            }
          };
          
          setCarData(transformedData);
        } else {
          setError('Failed to load car details');
        }

        // If car is sold, fetch order/buyer info
        if (response.data.data?.sold) {
          try {
            const orderResponse = await axios.get(`/api/orders/car/${id}`, {
              headers: {
                'Authorization': `Bearer ${auth?.accessToken}`
              },
              withCredentials: true
            });

            if (orderResponse.data.success && orderResponse.data.data) {
              setOrderData(orderResponse.data.data);
            }
          } catch (err) {
            console.log('Could not fetch order info for sold car:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching car data:', err);
        setError(err.response?.data?.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarData();
    }
  }, [id, auth]);

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
      <CarPriceActions price={carData.price} carData={carData} isAdminApproved={true} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CarSpecifications specifications={carData.specifications} />
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              <DealerInfo dealer={carData.dealer} />
              
              {/* Buyer Information (if sold) */}
              {orderData && (
                <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-6">
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

              {/* Shipping Location (if sold) */}
              {orderData && (
                <div className="bg-gray-800 border border-green-500/30 rounded-lg p-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedCarDetail;
