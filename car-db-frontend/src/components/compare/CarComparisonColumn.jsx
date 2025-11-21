import Button from "./Button";
import { Card } from "./Card";
import { X, Play } from "lucide-react";
import { useState } from "react";

const CarComparisonColumn = ({ 
  name, 
  image, 
  price, 
  location, 
  quickSpecs,
  sections,
  mediaItems,
  vehicleHistoryId,
  onRemove,
  isActive,
  onToggleActive
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-gray-700 bg-gray-800">
        <div 
          className="relative aspect-video w-full overflow-hidden bg-gray-900 cursor-pointer"
          onClick={onToggleActive}
        >
          <img 
            src={image} 
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
          />
          {isActive && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <Button
                variant="destructive"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="shadow-lg hover:opacity-80 hover:brightness-90"
              >
                <X className="w-5 h-5 mr-2" />
                Remove Car
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 min-h-[3.5rem]">{name}</h3>
            <div className="flex items-center justify-between text-sm gap-2">
              <span className="text-blue-500 font-semibold flex-shrink-0">{price}</span>
              <span className="text-gray-400 truncate flex-1 text-right">{location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
            {quickSpecs.map((spec, index) => (
              <div key={index} className="space-y-1">
                <div className="text-xs text-gray-400 uppercase tracking-wide">{spec.label}</div>
                <div className="text-sm text-white font-medium">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CarComparisonColumn;
