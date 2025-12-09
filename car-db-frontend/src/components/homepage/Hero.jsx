import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;

  const slides = [
    {
      image: "https://picsum.photos/id/111/1920/1080",
      title: "Find your dream car",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Experience the thrill of the drive with our premium selection.",
    },
    {
      image: "https://picsum.photos/id/133/1920/1080",
      title: "Luxury at its finest",
      description:
        "Discover premium vehicles that combine elegance with performance. Your journey to excellence starts here.",
    },
    {
      image: "https://picsum.photos/id/183/1920/1080",
      title: "Performance redefined",
      description:
        "Experience power and precision with our collection of high-performance vehicles designed for enthusiasts.",
    },
    {
      image: "https://picsum.photos/id/193/1920/1080",
      title: "Adventure awaits",
      description:
        "Embrace the open road with vehicles built for exploration and unforgettable journeys.",
    },
  ];

  // Auto-play slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url('${slides[currentSlide].image}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-darker/90 via-darker/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
        <div className="max-w-2xl">
          <h1
            key={`title-${currentSlide}`}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fade-in-up"
          >
            {slides[currentSlide].title.split(" ").slice(0, 2).join(" ")} <br />
            <span className="text-white">
              {slides[currentSlide].title.split(" ").slice(2).join(" ")}
            </span>
          </h1>
          <p
            key={`desc-${currentSlide}`}
            className="text-lg md:text-xl text-slate-300 mb-8 max-w-lg leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            {slides[currentSlide].description}
          </p>

          <button
            className="bg-primary hover:bg-sky-400 text-white px-8 py-3.5 rounded font-semibold transition-all shadow-lg shadow-primary/25 transform hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
            onClick={() => navigate("/carlisting")}
          >
            Explore Now !!!
          </button>

          {/* Slider Dots */}
          <div className="flex gap-3 mt-12">
            {slides.map((_, index) => (
              <div
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-primary w-8"
                    : "bg-slate-600 hover:bg-slate-400"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
