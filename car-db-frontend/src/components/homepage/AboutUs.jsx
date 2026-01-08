import React from "react";

const AboutUs = () => {
  return (
    <section id="about-us" className="bg-card py-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold mb-8">About Us</h2>

        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <p className="text-slate-300 mb-12 leading-relaxed text-justify">
              We connect people who want to buy and sell cars easily, safely, and with confidence. Our platform brings together a wide range of quality vehicles and trusted sellers, helping buyers find the right car at the right price. We aim to make the entire process transparent and hassle-free, from listing your car for sale to driving home your next one.
            </p>

            <div className="grid grid-cols-2 gap-y-12 gap-x-8">
              <div className="relative pl-4 border-l-4 border-primary">
                <div className="text-4xl font-bold text-white mb-1">150</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">
                  Vehicle In Stock
                </div>
              </div>

              <div className="relative pl-4 border-l-4 border-primary">
                <div className="text-4xl font-bold text-white mb-1">40</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">
                  Sold Car
                </div>
              </div>

              <div className="relative pl-4 border-l-4 border-primary">
                <div className="text-4xl font-bold text-white mb-1">38</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">
                  Happy Customer
                </div>
              </div>

              <div className="relative pl-4 border-l-4 border-primary">
                <div className="text-4xl font-bold text-white mb-1">5</div>
                <div className="text-sm text-slate-400 uppercase tracking-wide">
                  Awards
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-darker to-dark rounded-lg overflow-hidden relative border border-slate-800 shadow-2xl">
              <img
                src="https://picsum.photos/id/234/800/600"
                alt="Car Silhouette"
                className="w-full h-full object-cover opacity-60 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-500"
              />
              {/* Decorative Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[80px] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
