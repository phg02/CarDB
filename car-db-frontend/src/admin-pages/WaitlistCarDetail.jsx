import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import CarHeroSection from '../components/cardetails/CarHeroSection';
import CarImageGallery from '../components/cardetails/CarImageGallery';
import CarPriceActions from '../components/cardetails/CarPriceActions';
import CarSpecifications from '../components/cardetails/CarSpecifications';
import DealerInfo from '../components/cardetails/DealerInfo';
import { useAuth } from '../context/AuthContext';

const CarDetails = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [carData, setCarData] = useState(null);
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
          headers: {
            'Authorization': `Bearer ${auth?.accessToken}`
          },
          withCredentials: true
        });
        const car = response.data.data;

        // Transform the API data to match the component's expected format
        const transformedData = {
          name: `${car.make} ${car.model}`,
          heroImage: car.photo_links && car.photo_links.length > 0 ? car.photo_links[0] : 'https://via.placeholder.com/400x300',
          images: car.photo_links && car.photo_links.length > 0 ? car.photo_links : ['https://via.placeholder.com/400x300'],
          price: new Intl.NumberFormat('vi-VN').format(car.price) + ' đ',
          specifications: {
            leftColumn: [
              {
                title: "Basic Car Details",
                items: [
                  { label: "Year", value: car.year?.toString() || 'N/A' },
                  { label: "Model", value: car.model || 'N/A' },
                  { label: "Mileage", value: car.miles ? `${car.miles} mi` : 'N/A' },
                  { label: "Color", value: car.exterior_color || 'N/A' },
                  { label: "Fuel Type", value: car.fuel_type || 'N/A' },
                  { label: "Doors", value: car.doors?.toString() || 'N/A' },
                ]
              },
              {
                title: "Body & Exterior Type",
                items: [
                  { label: "Body Type", value: car.body_type || 'N/A' },
                  { label: "Drivetrain", value: car.drivetrain || 'N/A' },
                  { label: "Doors", value: car.doors?.toString() || 'N/A' },
                  { label: "Transmission", value: car.transmission || 'N/A' },
                ]
              },
              {
                title: "Engine & Powertrain",
                items: [
                  { label: "Engine", value: car.engine || 'N/A' },
                  { label: "Engine Size", value: car.engine_size || 'N/A' },
                  { label: "Engine Block", value: car.engine_block || 'N/A' },
                  { label: "Cylinders", value: car.cylinders?.toString() || 'N/A' },
                  { label: "Fuel Type", value: car.fuel_type || 'N/A' },
                  { label: "Powertrain Type", value: car.powertrain_type || 'N/A' },
                ]
              },
              {
                title: "Dimensions & Capacity",
                items: [
                  { label: "Overall Height", value: car.overall_height || 'N/A' },
                  { label: "Overall Length", value: car.overall_length || 'N/A' },
                  { label: "Overall Width", value: car.overall_width || 'N/A' },
                  { label: "Cargo Capacity", value: car.std_seating ? `${car.std_seating} seats` : 'N/A' },
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
                  { label: "Highway Fuel", value: car.highway_mpg || 'N/A' },
                  { label: "City Fuel", value: car.city_mpg || 'N/A' },
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
                  { label: "Previous Owner", value: car.carfax_clean_title ? 'Clean Title' : 'N/A' },
                  { label: "Clean Title", value: car.carfax_clean_title ? 'Yes' : 'No' },
                ]
              }
            ]
          },
          dealer: {
            name: car.seller?.name || 'Unknown Seller',
            title: 'Car Seller',
            photo: car.seller?.profileImage || null,
            phone: car.seller?.phone || 'N/A',
            email: car.seller?.email || 'N/A',
            location: car.dealer ? `${car.dealer.street || ''} ${car.dealer.city || ''}, ${car.dealer.state || ''}, ${car.dealer.country || ''}`.trim().replace(/^, |, $/, '') : 'Location not specified'
          }
        };

        setCarData(transformedData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch car details');
        toast.error('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading car details...</div>
      </div>
    );
  }

  if (error || !carData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error || 'Car not found'}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900">
      <CarHeroSection carName={carData.name} heroImage={carData.images[selectedImageIndex]} />
      <CarImageGallery images={carData.images} selectedImage={selectedImageIndex} onImageSelect={setSelectedImageIndex} />
      <CarPriceActions price={carData.price} carData={carData} isAdminWaitlist={true} carId={id} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CarSpecifications specifications={carData.specifications} />
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <DealerInfo dealer={carData.dealer} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
