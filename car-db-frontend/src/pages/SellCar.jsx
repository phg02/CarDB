import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { api } from "../lib/utils";

export default function SellCar() {
    const [condition, setCondition] = useState("new");
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { auth } = useAuth();
    const token = auth?.accessToken;

    // Check for payment status on component mount
    useEffect(() => {
        const paymentStatus = searchParams.get('payment_status');
        if (paymentStatus === 'failed') {
            toast.error('Transaction cancelled or failed. Please try again.');
        } else if (paymentStatus === 'success') {
            toast.success('Payment successful! Your car listing has been published.');
            // Redirect to settings page to view the listing
            setTimeout(() => {
                navigate('/settings?tab=my-listed-car');
            }, 2000);
        }
    }, [searchParams, navigate]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
            file: file
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!token) {
                setError("Please login to sell a car");
                navigate("/login");
                return;
            }

            const formData = new FormData(e.target);
            
            // Add file uploads
            imagePreviews.forEach(preview => {
                formData.append("photos", preview.file);
            });

            // Extract car data from form
            const carData = {
                heading: formData.get("title"),
                price: parseInt(formData.get("price")),
                miles: parseInt(formData.get("miles")) || 0,
                condition: condition,
                vehicle_type: formData.get("vehicle_type"),
                year: parseInt(formData.get("year")),
                make: formData.get("make"),
                model: formData.get("model"),
                trim: formData.get("trim"),
                made_in: formData.get("made_in"),
                body_type: formData.get("body_type"),
                body_subtype: formData.get("body_subtype"),
                doors: formData.get("doors"),
                engine: formData.get("engine"),
                engine_size: formData.get("engine_size"),
                engine_block: formData.get("engine_block"),
                cylinders: formData.get("cylinders"),
                fuel_type: formData.get("fuel_type"),
                powertrain: formData.get("powertrain"),
                transmission: formData.get("transmission"),
                drivetrain: formData.get("drivetrain"),
                highway_mpg: parseInt(formData.get("highway_mpg")) || 0,
                city_mpg: parseInt(formData.get("city_mpg")) || 0,
                overall_height: formData.get("overall_height"),
                overall_length: formData.get("overall_length"),
                overall_width: formData.get("overall_width"),
                std_seating: parseInt(formData.get("std_seating")) || 0,
                exterior_color: formData.get("exterior_color"),
                interior_color: formData.get("interior_color"),
                base_ext_color: formData.get("base_ext_color"),
                base_int_color: formData.get("base_int_color"),
                vin: formData.get("vin"),
                inventory_type: condition === "new" ? "new" : "used",
                owners: parseInt(formData.get("owners")) || 0,
                carfax_clean_title: formData.get("carfax_clean_title"),
                phone: formData.get("phone"),
                dealer: {
                    street: formData.get("street"),
                    city: formData.get("city"),
                    state: formData.get("state"),
                    country: formData.get("country"),
                },
            };

            // Basic validation
            if (!carData.heading || carData.heading.trim() === "") {
                setError("Please enter a title for your car listing");
                return;
            }
            if (!carData.price || carData.price <= 0) {
                setError("Please enter a valid price");
                return;
            }
            if (carData.miles < 0) {
                setError("Please enter valid mileage");
                return;
            }
            if (imagePreviews.length === 0) {
                setError("Please upload at least one image of your car");
                return;
            }

            // Create FormData for multipart request
            const submitData = new FormData();
            Object.entries(carData).forEach(([key, value]) => {
                if (key === 'dealer' && typeof value === 'object') {
                    // Handle nested dealer object
                    Object.entries(value).forEach(([dealerKey, dealerValue]) => {
                        if (dealerValue !== null && dealerValue !== undefined && dealerValue !== "") {
                            submitData.append(`dealer[${dealerKey}]`, dealerValue);
                        }
                    });
                } else if (value !== null && value !== undefined && value !== "") {
                    submitData.append(key, value);
                }
            });
            
            // Add files
            imagePreviews.forEach(preview => {
                submitData.append("photos", preview.file);
            });

            // SECURITY: User ID is extracted from JWT token on the backend
            // No need to send sellerId in the request
            const response = await api.post('/cars/initiate', submitData, {
                headers: {
                    "Authorization": `Bearer ${token}`, // Send JWT token
                },
            });

            console.log('Car post initiated successfully:', response.data);
            
            // Car post created successfully, now initiate VNPay payment
            console.log('Initiating payment for postingFeeId:', response.data.data.postingFeeId);
            const paymentResponse = await api.post('/posting-fee/pay/checkout', {
                postingFeeId: response.data.data.postingFeeId,
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            console.log('Payment URL received:', paymentResponse.data);
            
            // Redirect to VNPay payment page
            console.log('Redirecting to:', paymentResponse.data.data.url);
            window.location.href = paymentResponse.data.data.url;
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.message || "An error occurred while submitting the form");
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen bg-background">
      {/* Main Form */}
      <main className="container mx-auto max-w-4xl px-6 py-8 pb-24">
        {/* Bread crumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
          <span>/</span>
          <span className="text-white">Sell Car</span>
        </nav>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
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
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
                <select name="vehicle_type" className="w-full bg-input border-border rounded py-2 px-3">
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
                <label className="text-sm text-muted-foreground mb-2 block">Mileage</label>
                <div className="relative">
                  <input id="miles" name="miles" type="number" className="bg-input border-border pr-16 rounded w-full py-2 px-3" placeholder="0" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">miles</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Make</label>
                <select name="make" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="ford">Ford</option>
                  <option value="chevrolet">Chevrolet</option>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes-Benz</option>
                  <option value="audi">Audi</option>
                  <option value="nissan">Nissan</option>
                  <option value="hyundai">Hyundai</option>
                  <option value="kia">Kia</option>
                  <option value="volkswagen">Volkswagen</option>
                  <option value="subaru">Subaru</option>
                  <option value="mazda">Mazda</option>
                  <option value="lexus">Lexus</option>
                  <option value="acura">Acura</option>
                  <option value="infiniti">Infiniti</option>
                  <option value="tesla">Tesla</option>
                  <option value="other">Other</option>
                </select>
              </div>

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
                <select name="made_in" className="w-full bg-input border-border rounded py-2 px-3">
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
                <select name="body_type" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select Option</option>
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="suv">SUV</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Body Subtype</label>
                <select name="body_subtype" className="w-full bg-input border-border rounded py-2 px-3">
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
                <select name="engine_size" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="2.0">2.0L</option>
                  <option value="3.0">3.0L</option>
                  <option value="4.0">4.0L</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Engine Block</label>
                <select name="engine_block" className="w-full bg-input border-border rounded py-2 px-3">
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
                <select name="fuel_type" className="w-full bg-input border-border rounded py-2 px-3">
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
                  <input type="number" name="highway_mpg" className="bg-input border-border pr-16 rounded w-full py-2 px-3" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">mpg</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">City mpg</label>
                <div className="relative">
                  <input type="number" name="city_mpg" className="bg-input border-border pr-16 rounded w-full py-2 px-3" />
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
                <select name="overall_height" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Length</label>
                <select name="overall_length" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Width</label>
                <select name="overall_width" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="narrow">Narrow</option>
                  <option value="standard">Standard</option>
                  <option value="wide">Wide</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Seating</label>
                <select name="std_seating" className="w-full bg-input border-border rounded py-2 px-3">
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
                <select name="exterior_color" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="silver">Silver</option>
                  <option value="red">Red</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Interior Color</label>
                <select name="interior_color" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="tan">Tan</option>
                  <option value="gray">Gray</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Base Exterior Color</label>
                <select name="base_ext_color" className="w-full bg-input border-border rounded py-2 px-3">
                  <option value="">Select option</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="silver">Silver</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Base Interior Color</label>
                <select name="base_int_color" className="w-full bg-input border-border rounded py-2 px-3">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="vin" className="text-sm text-muted-foreground mb-2 block">VIN (Vehicle Identification Number)</label>
                <input id="vin" name="vin" className="bg-input border-border rounded w-full py-2 px-3" placeholder="Enter 17-character VIN" />
              </div>

              <div>
                <label htmlFor="owners" className="text-sm text-muted-foreground mb-2 block">Number of Previous Owner</label>
                <input id="owners" name="owners" type="number" className="bg-input border-border rounded w-full py-2 px-3" placeholder="0" />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Clean title</label>
                <select name="carfax_clean_title" className="w-full bg-input border-border rounded py-2 px-3">
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
                <label htmlFor="street" className="text-sm text-muted-foreground mb-2 block">Street Address</label>
                <input id="street" name="street" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="text-sm text-muted-foreground mb-2 block">City</label>
                <input id="city" name="city" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>

              <div>
                <label htmlFor="state" className="text-sm text-muted-foreground mb-2 block">State/Province</label>
                <input id="state" name="state" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>

              <div>
                <label htmlFor="country" className="text-sm text-muted-foreground mb-2 block">Country</label>
                <input id="country" name="country" className="bg-input border-border rounded w-full py-2 px-3" />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold py-6 text-lg rounded transition-all"
            >
              {loading ? "Processing..." : "Sell My Car"}
            </button>
          </div>
        </form>
      </main>
        </div>
    );
}