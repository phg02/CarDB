import React from "react";

const Forums = () => {
  return (
    <section className="container mx-auto px-4 md:px-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-10">Forums</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Feature */}
        <div className="relative group overflow-hidden rounded-lg min-h-[400px]">
          <img
            src="https://picsum.photos/id/1011/800/800"
            alt="Main Forum"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darker via-darker/50 to-transparent"></div>

          <div className="absolute top-6 right-6">
            <span className="bg-primary text-white text-xs px-3 py-1 rounded shadow-lg">
              June, 01 2021
            </span>
          </div>

          <div className="absolute bottom-0 left-0 p-8 w-full">
            <h3 className="text-3xl font-bold text-primary mb-3">Etiam Eget</h3>
            <p className="text-slate-300 mb-6 line-clamp-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
              eget praesent gravida sed rutrum suspendisse eu.
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://picsum.photos/id/64/100/100"
                alt="Author"
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
              <span className="text-sm font-medium">By Carla Baptista</span>
            </div>
          </div>
        </div>

        {/* Secondary List */}
        <div className="flex flex-col gap-6">
          {/* Item 1 */}
          <div className="flex-1 relative rounded-lg overflow-hidden group">
            <img
              src="https://picsum.photos/id/112/800/400"
              alt="Sub Forum"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-darker via-darker/70 to-transparent"></div>

            <div className="absolute inset-0 p-6 flex flex-col justify-center max-w-md">
              <h3 className="text-xl font-bold text-primary mb-2">A New Car</h3>
              <p className="text-sm text-slate-300 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <img
                  src="https://picsum.photos/id/64/50/50"
                  alt="Author"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-slate-400">
                  By Carla Baptista - May, 28 2021
                </span>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex-1 relative rounded-lg overflow-hidden group">
            <img
              src="https://picsum.photos/id/146/800/400"
              alt="Sub Forum"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-darker via-darker/70 to-transparent"></div>

            <div className="absolute inset-0 p-6 flex flex-col justify-center max-w-md">
              <h3 className="text-xl font-bold text-primary mb-2">A New Car</h3>
              <p className="text-sm text-slate-300 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <div className="flex items-center gap-2 mt-auto">
                <img
                  src="https://picsum.photos/id/64/50/50"
                  alt="Author"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-slate-400">
                  By Carla Baptista - May, 28 2021
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Forums;
