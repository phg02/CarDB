import { useParams } from 'react-router-dom';
import { useState } from 'react';
import CarHeroSection from '../components/CarHeroSection';
import CarImageGallery from '../components/CarImageGallery';
import CarPriceActions from '../components/CarPriceActions';
import CarSpecifications from '../components/CarSpecifications';
import DealerInfo from '../components/DealerInfo';
import ScrollToTop from '../components/ScrollToTop';

const CarDetails = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Sample data - replace with API call using the id
  const carData = {
    name: "Tesla Model 3 Standard Range Plus",
    heroImage: "https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg",
    images: [
      "https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg",
      "https://www.thedrive.com/wp-content/uploads/images-by-url-td/content/archive-images/031116-mercedes-amg-e43-hero.jpg?quality=85",
      "https://www.clinkardcars.co.uk/blobs/Images/Stock/247/befd7306-8ffb-4463-a549-a7fb596cf5ef.JPG?width=2000&height=1333",
      "https://www.autoblog.com/.image/w_3840,q_auto:good,c_limit/MjA5MTMwNzQ5NDQ3MTg2Mjc2/image-placeholder-title.jpg",
      "https://cdn.dealeraccelerate.com/mankato/1/4085/309291/1920x1440/1967-mercedes-benz-250sl-pagoda",
    ],
    price: "700,000,000 vnd",
    specifications: {
      leftColumn: [
        {
          title: "Basic Car Details",
          items: [
            { label: "Year", value: "2021" },
            { label: "Model", value: "Model 3" },
            { label: "Mileage", value: "0 mi" },
            { label: "Color", value: "Red" },
            { label: "Fuel Type", value: "Electric" },
            { label: "Doors", value: "4 doors" },
          ]
        },
        {
          title: "Body & Exterior Type",
          items: [
            { label: "Body Type", value: "Sedan" },
            { label: "Drivetrain", value: "All-Wheel Drive" },
            { label: "Doors", value: "4" },
            { label: "Transmission", value: "Automatic" },
          ]
        },
        {
          title: "Engine & Powertrain",
          items: [
            { label: "Engine", value: "55.0 kWh" },
            { label: "Engine Size", value: "0.0 kWh" },
            { label: "Engine Block", value: "100.2" },
            { label: "Cylinders", value: "331 mi" },
            { label: "Fuel Type", value: "Electric" },
            { label: "Powertrain Type", value: "331 mi" },
          ]
        },
        {
          title: "Dimensions & Capacity",
          items: [
            { label: "Overall Height", value: "4694 mm" },
            { label: "Overall Length", value: "1649 mm" },
            { label: "Overall Width", value: "1445 mm" },
            { label: "Cargo Capacity", value: "12.3" },
          ]
        }
      ],
      rightColumn: [
        {
          title: "Drivetrain & Transmission",
          items: [
            { label: "Transmission", value: "55.0 kWh" },
            { label: "Drivetrain", value: "0.0 kWh" },
          ]
        },
        {
          title: "Fuel Efficiency",
          items: [
            { label: "Highway Fuel", value: "4694 mm" },
            { label: "City Fuel", value: "1649 mm" },
          ]
        },
        {
          title: "Exterior & Interior Color",
          items: [
            { label: "Exterior Color", value: "Red Multi-Coat" },
            { label: "Interior Color", value: "Black" },
            { label: "Base Exterior Color", value: "Red" },
            { label: "Base Interior Color", value: "Black" },
          ]
        },
        {
          title: "Vehicle History",
          items: [
            { label: "Previous Owner", value: "None" },
            { label: "Clean Title", value: "Yes" },
          ]
        }
      ]
    },
    dealer: {
      name: "Alberto Gouse",
      title: "Car Dealer",
      photo: null,
      phone: "260-863-9770",
      email: "alfred@gmail.com",
      location: "9595 E Tesla Mansion Dr, Friant, CA, 93626, Kansas, USA"
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <CarHeroSection carName={carData.name} heroImage={carData.images[selectedImageIndex]} />
      <CarImageGallery images={carData.images} selectedImage={selectedImageIndex} onImageSelect={setSelectedImageIndex} />
      <CarPriceActions price={carData.price} />
      
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

      <ScrollToTop />
    </div>
  );
};

export default CarDetails;
