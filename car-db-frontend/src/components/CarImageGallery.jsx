import { useState } from "react";

const CarImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="container mx-auto px-4 pb-6 flex justify-center">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index
                ? "border-blue-500 shadow-lg shadow-blue-500/20"
                : "border-gray-700 hover:border-blue-500/50"
            }`}
          >
            <img
              src={image}
              alt={`Car view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarImageGallery;
