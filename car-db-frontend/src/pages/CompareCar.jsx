import Button from "../components/compare/Button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CarComparisonColumn from "../components/compare/CarComparisonColumn";
import AddCarCard from "../components/compare/AddCarCard";
import ComparisonRow from "../components/compare/ComparisonRow";
import MediaComparisonRow from "../components/compare/MediaComparisonRow";
import VehicleHistoryRow from "../components/compare/VehicleHistoryRow";

const CompareCar = () => {
  const [comparisonList, setComparisonList] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(null);

  useEffect(() => {
    // Load comparison list from localStorage
    const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
    setComparisonList(stored);
  }, []);

  const removeCar = (index) => {
    const newList = [...comparisonList];
    newList.splice(index, 1);
    setComparisonList(newList);
    localStorage.setItem('compareList', JSON.stringify(newList));
  };

  // Convert car data to comparison format
  const formatCarForComparison = (car) => ({
    name: car.name,
    // image is set below with a placeholder fallback
    price: car.price,
    location: car.dealer?.location || "Unknown",
    quickSpecs: [
      { label: "Year", value: car.specifications?.leftColumn?.[0]?.items?.[0]?.value || "N/A" },
      { label: "Fuel Type", value: car.specifications?.leftColumn?.[0]?.items?.[4]?.value || "N/A" },
      { label: "Transmission", value: car.specifications?.leftColumn?.[1]?.items?.[3]?.value || "N/A" },
      { label: "Drivetrain", value: car.specifications?.leftColumn?.[1]?.items?.[1]?.value || "N/A" },
    ],
    sections: [
      {
        title: "Basic Car Details",
        specs: car.specifications?.leftColumn?.[0]?.items || []
      },
      {
        title: "Body & Exterior",
        specs: car.specifications?.leftColumn?.[1]?.items || []
      },
      {
        title: "Engine & Powertrain",
        specs: car.specifications?.leftColumn?.[2]?.items || []
      },
      {
        title: "Dimensions",
        specs: car.specifications?.leftColumn?.[3]?.items || []
      }
    ],
    mediaItems: (car.images || []).slice(0, 4).map(img => ({ type: "image", src: img })),
    image: car.heroImage || car.images?.[0] || 'https://via.placeholder.com/400x300',
    vehicleHistoryId: `CAR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  });

  const activeCarsCount = comparisonList.length;
  const gridCols = activeCarsCount === 0 ? "md:grid-cols-1" : activeCarsCount === 1 ? "md:grid-cols-1" : activeCarsCount === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  const formattedCars = comparisonList.map(formatCarForComparison);

  return (
    <div className="min-h-screen bg-black">
      <div className="">
        <div className="container mx-auto px-4 pt-6">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
            <span>/</span>
            <span className="text-white">Compare Car</span>
          </nav>
          <h1 className="text-3xl font-bold text-white mb-1">Compare Car</h1>
          <p className="text-gray-400">Compare up to 3 vehicles side by side</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Car Header Cards - Always 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[0, 1, 2].map((slotIndex) => {
            const car = comparisonList[slotIndex];
            if (car) {
              const formatted = formatCarForComparison(car);
              return (
                <CarComparisonColumn 
                  key={slotIndex}
                  name={formatted.name}
                  image={formatted.image}
                  price={formatted.price}
                  location={formatted.location}
                  quickSpecs={formatted.quickSpecs}
                  sections={[]}
                  mediaItems={[]}
                  vehicleHistoryId=""
                  onRemove={() => removeCar(slotIndex)}
                  isActive={activeCardIndex === slotIndex}
                  onToggleActive={() => setActiveCardIndex(activeCardIndex === slotIndex ? null : slotIndex)}
                />
              );
            } else {
              return <AddCarCard key={`empty-${slotIndex}`} />;
            }
          })}
        </div>

        {/* Merged Specification Rows */}
        {comparisonList.length > 0 && (
          <div className="space-y-4">
            <ComparisonRow 
              title="Basic Car Details"
              cars={[0, 1, 2].map(i => comparisonList[i] ? { specs: formatCarForComparison(comparisonList[i]).sections[0].specs } : { specs: [] })}
            />
            <ComparisonRow 
              title="Body & Exterior"
              cars={[0, 1, 2].map(i => comparisonList[i] ? { specs: formatCarForComparison(comparisonList[i]).sections[1].specs } : { specs: [] })}
            />
            <ComparisonRow 
              title="Engine & Powertrain"
              cars={[0, 1, 2].map(i => comparisonList[i] ? { specs: formatCarForComparison(comparisonList[i]).sections[2].specs } : { specs: [] })}
            />
            <ComparisonRow 
              title="Dimensions"
              cars={[0, 1, 2].map(i => comparisonList[i] ? { specs: formatCarForComparison(comparisonList[i]).sections[3].specs } : { specs: [] })}
            />
            <MediaComparisonRow 
              cars={[0, 1, 2].map(i => comparisonList[i] ? { mediaItems: formatCarForComparison(comparisonList[i]).mediaItems } : { mediaItems: [] })}
            />
            <VehicleHistoryRow 
              cars={[0, 1, 2].map(i => comparisonList[i] ? { vehicleHistoryId: formatCarForComparison(comparisonList[i]).vehicleHistoryId } : { vehicleHistoryId: '' })}
            />
          </div>
        )}

        <div className="flex justify-center pt-8">
          <Link to="/carlisting">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Car Listing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareCar;
