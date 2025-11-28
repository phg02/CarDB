import React from "react";
import { ChevronUp } from "lucide-react";

const Hero = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] flex items-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://picsum.photos/id/111/1920/1080')`, // Using a car-like or generic darkened image
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-darker/90 via-darker/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Find your <br />
            <span className="text-white">dream car</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-lg leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Experience
            the thrill of the drive with our premium selection.
          </p>

          <button className="bg-primary hover:bg-sky-400 text-white px-8 py-3.5 rounded font-semibold transition-all shadow-lg shadow-primary/25 transform hover:-translate-y-1">
            Explore Now !!!
          </button>

          {/* Slider Dots */}
          <div className="flex gap-3 mt-12">
            <div className="w-3 h-3 rounded-full bg-primary cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-400 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-400 cursor-pointer transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-400 cursor-pointer transition-colors"></div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-10 right-10 z-20 bg-primary hover:bg-sky-400 p-3 rounded-full shadow-lg transition-transform hover:scale-110"
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} className="text-white" />
      </button>
    </div>
  );
};

export default Hero;
