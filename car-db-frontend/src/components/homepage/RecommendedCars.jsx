import React from "react";
import {
  MapPin,
  Calendar,
  Settings,
  Fuel,
  Users,
  ChevronRight,
} from "lucide-react";



const cars = [
  {
    id: "1",
    title: "Tesla Model 3 Standard Range Plus",
    price: 1210000000,
    location: "Florida, USA",
    year: 2020,
    transmission: "Rear-wheel Drive",
    fuel: "Electric",
    seats: 5,
    image: "https://picsum.photos/id/133/600/400",
    isFeatured: true,
    isNew: true,
  },
  {
    id: "2",
    title: "Ford F-250 Super Duty",
    price: 860000000,
    location: "Milan, Italy",
    year: 2021,
    transmission: "Four-wheel Drive",
    fuel: "Diesel",
    seats: 5,
    image: "https://picsum.photos/id/1071/600/400",
    isFeatured: true,
    isNew: true,
  },
  {
    id: "3",
    title: "Honda Pilot Touring 7-Passenger",
    price: 498000000,
    location: "Caracas, Venezuela",
    year: 2021,
    transmission: "All-wheel Drive",
    fuel: "Gasoline",
    seats: 7,
    image: "https://picsum.photos/id/183/600/400",
    isNew: true,
  },
];

const RecommendedCars = () => {
  return (
    <section className="container mx-auto px-4 md:px-6 pt-16">
      <div className="flex justify-between items-end mb-10">
        <h2 className="text-2xl md:text-3xl font-bold">Recommended Cars</h2>
        <a
          href="#"
          className="text-primary hover:text-sky-300 text-sm flex items-center gap-1 font-medium"
        >
          See more <ChevronRight size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-card rounded-lg overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-slate-800 relative"
          >
            {/* Featured Ribbon */}
            {car.isFeatured && (
              <div className="absolute top-4 -left-4 z-20">
                <div className="bg-primary text-white text-xs font-bold py-1 px-8 transform -rotate-45 shadow-md">
                  Featured
                </div>
              </div>
            )}

            {/* Image Container */}
            <div className="relative overflow-hidden aspect-[4/3]">
              <img
                src={car.image}
                alt={car.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-darker/80 to-transparent opacity-60"></div>

              {car.isNew && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-darker/80 text-primary border border-primary/30 px-2 py-1 rounded text-xs uppercase font-bold backdrop-blur-sm">
                    New
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                {car.title}
              </h3>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">
                  VND {car.price.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                <MapPin size={14} />
                <span>{car.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-300 border-t border-slate-700 pt-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-primary" />
                  <span className="truncate">{car.transmission}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel size={14} className="text-primary" />
                  <span>{car.fuel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  <span>{car.seats}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedCars;
