import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function SellCar() {
    const [condition, setCondition] = useState("new");
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImagePreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index].url);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    return (
    <div className="min-h-screen bg-background">
            {/* Hero Section */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 w-full max-w-[1200px] mb-6 pr-4">
        <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
        <span>/</span>
        <span className="text-white">Car Listing</span>
      </nav>

      {/* Main Form */}
      <main className="container mx-auto max-w-4xl px-6 py-8 pb-24">
        <form className="space-y-8">
          {/* Images Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Images</h2>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview.url} 
                      alt={preview.name}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <label htmlFor="carImages" className="block bg-card border border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors cursor-pointer">
              <input 
                type="file" 
                id="carImages" 
                name="carImages" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
                <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Upload your image</p>
              </div>
            </label>
          </section>

          {/* Price Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Price</h2>
            <div>
              <label htmlFor="price" className="text-sm text-muted-foreground mb-2 block">Full Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input id="price" name="price" type="number" className="pl-8 bg-input border-border rounded w-full py-2" placeholder="0" />
              </div>
            </div>
          </section>

          {/* Basic Car Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Car Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="text-sm text-muted-foreground mb-2 block">Title</label>
                <input id="title" name="title" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Condition</label>
                <div className="flex gap-6 mt-3">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="new" name="condition" value="new" checked={condition === 'new'} onChange={() => setCondition('new')} className="accent-primary" />
                    <label htmlFor="new" className="cursor-pointer">New</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="used" name="condition" value="used" checked={condition === 'used'} onChange={() => setCondition('used')} className="accent-primary" />
                    <label htmlFor="used" className="cursor-pointer">Used</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Vehicle type</label>
                <select name="vehicleType" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="coupe">Coupe</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Year</label>
                <select name="year" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  {Array.from({ length: 30 }, (_, i) => 2024 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Make</label>
                <select name="make" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="bmw">BMW</option>
                  <option value="chevrolet">Chevrolet</option>
                  <option value="ford">Ford</option>
                  <option value="fiat">Fiat</option>
                  <option value="honda">Honda</option>
                  <option value="toyota">Toyota</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Model</label>
                <select name="model" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="model1">Model 1</option>
                  <option value="model2">Model 2</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Trim</label>
                <select name="trim" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="base">Base</option>
                  <option value="sport">Sport</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Made in</label>
                <select name="madeIn" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="usa">USA</option>
                  <option value="germany">Germany</option>
                  <option value="japan">Japan</option>
                </select>
              </div>
            </div>
          </section>

          {/* Body & Exterior Type */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Body & Exterior Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Body Type</label>
                <select name="bodyType" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="suv">SUV</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Body Subtype</label>
                <select name="bodySubtype" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="standard">Standard</option>
                  <option value="extended">Extended</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Doors</label>
                <select name="doors" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Options</option>
                  <option value="2">2 doors</option>
                  <option value="4">4 doors</option>
                  <option value="5">5 doors</option>
                </select>
              </div>
            </div>
          </section>

          {/* Engine & Powertrain */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Engine & Powertrain</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Engine</label>
                <select name="engine" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="v6">V6</option>
                  <option value="v8">V8</option>
                  <option value="i4">Inline 4</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Engine Size</label>
                <select name="engineSize" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="2.0">2.0L</option>
                  <option value="3.0">3.0L</option>
                  <option value="4.0">4.0L</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Engine Block</label>
                <select name="engineBlock" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="inline">Inline</option>
                  <option value="v">V-type</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Cylinders</label>
                <select name="cylinders" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Fuel Type</label>
                <select name="fuelType" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Powertrain type</label>
                <select name="powertrain" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="fwd">FWD</option>
                  <option value="rwd">RWD</option>
                  <option value="awd">AWD</option>
                </select>
              </div>
            </div>
          </section>

          {/* Performance & Drivetrain */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Performance & Drivetrain</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Transmission</label>
                <select name="transmission" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                  <option value="cvt">CVT</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Drivetrain</label>
                <select name="drivetrain" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="fwd">Front-wheel drive</option>
                  <option value="rwd">Rear-wheel drive</option>
                  <option value="awd">All-wheel drive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Highway mpg</label>
                <div className="relative">
                  <input type="number" name="highwayMpg" className="bg-input border-border pr-16 rounded w-full py-2 px-3" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">mpg</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">City mpg</label>
                <div className="relative">
                  <input type="number" name="cityMpg" className="bg-input border-border pr-16 rounded w-full py-2 px-3" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">mpg</span>
                </div>
              </div>
            </div>
          </section>

          {/* Dimension & Capacity */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Dimension & Capacity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Height</label>
                <select name="height" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Length</label>
                <select name="length" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Width</label>
                <select name="width" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="narrow">Narrow</option>
                  <option value="standard">Standard</option>
                  <option value="wide">Wide</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Seating</label>
                <select name="seating" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="2">2 seats</option>
                  <option value="4">4 seats</option>
                  <option value="5">5 seats</option>
                  <option value="7">7 seats</option>
                </select>
              </div>
            </div>
          </section>

          {/* Exterior & Interior Color */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Exterior & Interior Color</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Exterior Color</label>
                <select name="exteriorColor" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="silver">Silver</option>
                  <option value="red">Red</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Interior Color</label>
                <select name="interiorColor" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="tan">Tan</option>
                  <option value="gray">Gray</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Base Exterior Color</label>
                <select name="baseExteriorColor" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="silver">Silver</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Base Interior Color</label>
                <select name="baseInteriorColor" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="tan">Tan</option>
                  <option value="gray">Gray</option>
                </select>
              </div>
            </div>
          </section>

          {/* Vehicle History */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Vehicle History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="owners" className="text-sm text-muted-foreground mb-2 block">Number of Previous Owner</label>
                <input id="owners" name="owners" type="number" className="bg-input border-border rounded w-full py-2 px-3" placeholder="0" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Clean title</label>
                <select name="cleanTitle" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </section>

          {/* Dealer Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Dealer Info</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="text-sm text-muted-foreground mb-2 block">Phone no.</label>
                <input id="phone" name="phone" type="tel" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>

              <div>
                <label htmlFor="address" className="text-sm text-muted-foreground mb-2 block">Address</label>
                <input id="address" name="address" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-6">
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded">
              Sell My Car
            </button>
          </div>
        </form>
      </main>
        </div>
    );
}