import { Card } from "./Card";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import ImageViewer from "./ImageViewer";
import { useState } from "react";

const MediaComparisonRow = ({ cars }) => {
  const [viewerState, setViewerState] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const openViewer = (carIndex, imageIndex) => {
    const imageOnlyItems = cars[carIndex].mediaItems.filter(item => item.type !== "video");
    setViewerState({
      images: imageOnlyItems,
      initialIndex: imageIndex
    });
  };

  const closeViewer = () => {
    setViewerState(null);
  };

  return (
    <>
      <Card className="border-gray-700 bg-gray-800 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-base md:text-lg font-semibold text-white mb-4 uppercase tracking-wide hover:text-blue-400 transition-colors"
      >
        <div className="flex-1"></div>
        <h4 className="flex-1 text-center">Images & Video</h4>
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
          <div key={carIndex} className="grid grid-cols-2 gap-3">
            {car.mediaItems.map((item, index) => (
              <div 
                key={index}
                className="relative aspect-video overflow-hidden rounded-md bg-gray-900 cursor-pointer group"
                onClick={() => item.type !== "video" && openViewer(carIndex, index)}
              >
                <img 
                  src={item.type === "video" ? item.thumbnail : item.src} 
                  alt={`Media ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-500/90 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      </div>
    </Card>
    {viewerState && (
      <ImageViewer
        images={viewerState.images}
        initialIndex={viewerState.initialIndex}
        onClose={closeViewer}
      />
    )}
    </>
  );
};

export default MediaComparisonRow;
