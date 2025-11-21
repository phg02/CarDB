import { Card } from "./Card";
import Button from "./Button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const VehicleHistoryRow = ({ cars }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="border-gray-700 bg-gray-800 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-base md:text-lg font-semibold text-white mb-4 uppercase tracking-wide hover:text-blue-400 transition-colors"
      >
        <div className="flex-1"></div>
        <h4 className="flex-1 text-center">Vehicle History</h4>
        <div className="flex-1 flex justify-end">
          {isOpen ? <ChevronUp className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
      <div className={`grid ${cars.length === 1 ? 'grid-cols-1' : cars.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
        {cars.map((car, carIndex) => (
          <div key={carIndex} className="space-y-2">
            <div className="flex justify-between items-center text-sm bg-gray-900/50 p-2 rounded gap-2">
              <span className="text-gray-400 flex-shrink-0">Report ID</span>
              <span className="text-white font-mono text-xs truncate">{car.vehicleHistoryId}</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs sm:text-sm"
            >
              View Full History
            </Button>
          </div>
        ))}
      </div>
      </div>
    </Card>
  );
};

export default VehicleHistoryRow;
