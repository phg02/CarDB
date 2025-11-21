import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CarHeroSection from '../components/CarHeroSection';
import CarImageGallery from '../components/CarImageGallery';
import CarPriceActions from '../components/CarPriceActions';
import CarSpecifications from '../components/CarSpecifications';
import DealerInfo from '../components/DealerInfo';
import ScrollToTop from '../components/ScrollToTop';

const CarDetails = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Sample data - replace with API call using the id
  const allCarsData = [
    {
      name: "Tesla Model 3 Standard Range Plus",
      heroImage: "https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg",
      images: [
        "https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg",
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
    },
    {
      name: "BMW i4 M50",
      heroImage: "https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg",
      images: [
        "https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg",
        "https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg",
        "https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp",
        "https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg",
      ],
      price: "1,200,000,000 vnd",
      specifications: {
        leftColumn: [
          {
            title: "Basic Car Details",
            items: [
              { label: "Year", value: "2022" },
              { label: "Model", value: "i4 M50" },
              { label: "Mileage", value: "5,000 mi" },
              { label: "Color", value: "Blue" },
              { label: "Fuel Type", value: "Electric" },
              { label: "Doors", value: "4 doors" },
            ]
          },
          {
            title: "Body & Exterior Type",
            items: [
              { label: "Body Type", value: "Gran Coupe" },
              { label: "Drivetrain", value: "All-Wheel Drive" },
              { label: "Doors", value: "4" },
              { label: "Transmission", value: "Automatic" },
            ]
          },
          {
            title: "Engine & Powertrain",
            items: [
              { label: "Engine", value: "83.9 kWh" },
              { label: "Motor Power", value: "536 hp" },
              { label: "Torque", value: "795 Nm" },
              { label: "Battery", value: "83.9 kWh" },
              { label: "Fuel Type", value: "Electric" },
              { label: "Range", value: "510 km" },
            ]
          },
          {
            title: "Dimensions & Capacity",
            items: [
              { label: "Overall Height", value: "1448 mm" },
              { label: "Overall Length", value: "4783 mm" },
              { label: "Overall Width", value: "1852 mm" },
              { label: "Cargo Capacity", value: "470 L" },
            ]
          }
        ],
        rightColumn: [
          {
            title: "Drivetrain & Transmission",
            items: [
              { label: "Transmission", value: "Single-Speed" },
              { label: "Drivetrain", value: "AWD" },
            ]
          },
          {
            title: "Fuel Efficiency",
            items: [
              { label: "Combined", value: "18.0 kWh/100km" },
              { label: "City", value: "16.5 kWh/100km" },
            ]
          },
          {
            title: "Exterior & Interior Color",
            items: [
              { label: "Exterior Color", value: "Portimao Blue" },
              { label: "Interior Color", value: "Black" },
              { label: "Base Exterior Color", value: "Blue" },
              { label: "Base Interior Color", value: "Black" },
            ]
          },
          {
            title: "Vehicle History",
            items: [
              { label: "Previous Owner", value: "1" },
              { label: "Clean Title", value: "Yes" },
            ]
          }
        ]
      },
      dealer: {
        name: "Michael Schmidt",
        title: "BMW Specialist",
        photo: null,
        phone: "310-555-0199",
        email: "mschmidt@bmw-dealer.com",
        location: "1234 Sunset Blvd, Los Angeles, CA, 90026, USA"
      }
    },
    {
      name: "Mercedes-Benz C-Class 300",
      heroImage: "https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg",
      images: [
        "https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg",
        "https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg",
        "https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp",
      ],
      price: "900,000,000 vnd",
      specifications: {
        leftColumn: [
          {
            title: "Basic Car Details",
            items: [
              { label: "Year", value: "2021" },
              { label: "Model", value: "C-Class 300" },
              { label: "Mileage", value: "12,000 mi" },
              { label: "Color", value: "Silver" },
              { label: "Fuel Type", value: "Gasoline" },
              { label: "Doors", value: "4 doors" },
            ]
          },
          {
            title: "Body & Exterior Type",
            items: [
              { label: "Body Type", value: "Sedan" },
              { label: "Drivetrain", value: "Rear-Wheel Drive" },
              { label: "Doors", value: "4" },
              { label: "Transmission", value: "Automatic" },
            ]
          },
          {
            title: "Engine & Powertrain",
            items: [
              { label: "Engine", value: "2.0L Turbo" },
              { label: "Cylinders", value: "4" },
              { label: "Horsepower", value: "255 hp" },
              { label: "Torque", value: "295 lb-ft" },
              { label: "Fuel Type", value: "Premium Gasoline" },
              { label: "0-60 mph", value: "5.9s" },
            ]
          },
          {
            title: "Dimensions & Capacity",
            items: [
              { label: "Overall Height", value: "1442 mm" },
              { label: "Overall Length", value: "4751 mm" },
              { label: "Overall Width", value: "1820 mm" },
              { label: "Cargo Capacity", value: "370 L" },
            ]
          }
        ],
        rightColumn: [
          {
            title: "Drivetrain & Transmission",
            items: [
              { label: "Transmission", value: "9-Speed Automatic" },
              { label: "Drivetrain", value: "RWD" },
            ]
          },
          {
            title: "Fuel Efficiency",
            items: [
              { label: "Highway", value: "35 MPG" },
              { label: "City", value: "25 MPG" },
            ]
          },
          {
            title: "Exterior & Interior Color",
            items: [
              { label: "Exterior Color", value: "Iridium Silver" },
              { label: "Interior Color", value: "Black Leather" },
              { label: "Base Exterior Color", value: "Silver" },
              { label: "Base Interior Color", value: "Black" },
            ]
          },
          {
            title: "Vehicle History",
            items: [
              { label: "Previous Owner", value: "1" },
              { label: "Clean Title", value: "Yes" },
            ]
          }
        ]
      },
      dealer: {
        name: "Sarah Johnson",
        title: "Mercedes-Benz Consultant",
        photo: null,
        phone: "212-555-8888",
        email: "sjohnson@mercedes-dealer.com",
        location: "789 Park Avenue, New York, NY, 10021, USA"
      }
    },
    {
      name: "Audi e-tron GT",
      heroImage: "https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp",
      images: [
        "https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp",
        "https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg",
        "https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg",
      ],
      price: "3,500,000,000 vnd",
      specifications: {
        leftColumn: [
          {
            title: "Basic Car Details",
            items: [
              { label: "Year", value: "2023" },
              { label: "Model", value: "e-tron GT" },
              { label: "Mileage", value: "2,500 mi" },
              { label: "Color", value: "Gray" },
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
              { label: "Engine", value: "93.4 kWh" },
              { label: "Motor Power", value: "637 hp" },
              { label: "Torque", value: "830 Nm" },
              { label: "Battery", value: "93.4 kWh" },
              { label: "Fuel Type", value: "Electric" },
              { label: "Range", value: "488 km" },
            ]
          },
          {
            title: "Dimensions & Capacity",
            items: [
              { label: "Overall Height", value: "1396 mm" },
              { label: "Overall Length", value: "4989 mm" },
              { label: "Overall Width", value: "1964 mm" },
              { label: "Cargo Capacity", value: "405 L" },
            ]
          }
        ],
        rightColumn: [
          {
            title: "Drivetrain & Transmission",
            items: [
              { label: "Transmission", value: "Single-Speed" },
              { label: "Drivetrain", value: "Quattro AWD" },
            ]
          },
          {
            title: "Fuel Efficiency",
            items: [
              { label: "Combined", value: "19.2 kWh/100km" },
              { label: "City", value: "17.8 kWh/100km" },
            ]
          },
          {
            title: "Exterior & Interior Color",
            items: [
              { label: "Exterior Color", value: "Daytona Gray" },
              { label: "Interior Color", value: "Black/Red" },
              { label: "Base Exterior Color", value: "Gray" },
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
        name: "David Chen",
        title: "Audi Performance Specialist",
        photo: null,
        phone: "415-555-7777",
        email: "dchen@audi-dealer.com",
        location: "567 Market Street, San Francisco, CA, 94105, USA"
      }
    }
  ];

  const carData = allCarsData[parseInt(id) - 1] || allCarsData[0];

  return (
    <div className="min-h-screen bg-gray-900">
      <CarHeroSection carName={carData.name} heroImage={carData.images[selectedImageIndex]} />
      <CarImageGallery images={carData.images} selectedImage={selectedImageIndex} onImageSelect={setSelectedImageIndex} />
      <CarPriceActions price={carData.price} carData={carData} />
      
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
