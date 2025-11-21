import { Card } from "./Card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const ComparisonRow = ({ title, cars }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Get all unique spec labels from all cars
  const allLabels = [...new Set(cars.flatMap(car => car.specs.map(spec => spec.label)))];
  
  return (
    <Card className="border-gray-700 bg-gray-800 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-base md:text-lg font-semibold text-white mb-4 uppercase tracking-wide hover:text-blue-400 transition-colors"
      >
        <div className="flex-1"></div>
        <h4 className="flex-1 text-center">{title}</h4>
        <div className="flex-1 flex justify-end">
          {isOpen ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3">
        {allLabels.map((label, labelIndex) => (
          <div key={labelIndex} className="border-b border-gray-700/50 last:border-0 pb-3 last:pb-0">
            <div className="text-sm text-gray-400 uppercase tracking-wide text-center mb-2 bg-gray-900/50 py-2 rounded">
              {label}
            </div>
            <div className={`grid ${cars.length === 1 ? 'grid-cols-1' : cars.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
              {cars.map((car, carIndex) => {
                const spec = car.specs.find(s => s.label === label);
                return (
                  <div key={carIndex} className="text-center">
                    <span className="text-sm text-white font-medium">
                      {spec?.value || 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </div>
    </Card>
  );
};

export default ComparisonRow;
