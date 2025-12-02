import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

function VinDecoder() {
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDecode = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (vin.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }

    setLoading(true);

    // Simulate API call - Replace with actual VIN decoding API
    setTimeout(() => {
      // Mock data - replace with actual API response
      setResult({
        vin: vin.toUpperCase(),
        make: 'Tesla',
        model: 'Model 3',
        year: '2020',
        bodyStyle: 'Sedan',
        engine: 'Electric Motor',
        drivetrain: 'Rear-Wheel Drive',
        transmission: 'Automatic',
        fuelType: 'Electric',
        manufacturerLocation: 'Fremont, California, USA',
        plantCountry: 'United States',
        vehicleType: 'Passenger Car',
        trimLevel: 'Standard Range Plus',
        doors: '4',
        seats: '5',
        grossVehicleWeight: '2,100 kg',
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 w-full max-w-[1200px] mb-6">
        <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
        <span>/</span>
        <span className="text-white">VIN Decoder</span>
      </nav>

      {/* Main Content */}
      <div className="w-full max-w-[1200px]">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            VIN Decoder
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Enter your Vehicle Identification Number to get detailed information about your vehicle
          </p>
        </div>

        {/* VIN Input Form */}
        <div className="bg-gray-900 rounded-lg p-6 sm:p-8 mb-8 border border-gray-800">
          <form onSubmit={handleDecode} className="space-y-4">
            <div>
              <label htmlFor="vin" className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Identification Number (VIN)
              </label>
              <input
                type="text"
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                maxLength={17}
                placeholder="Enter 17-character VIN"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-wider"
              />
              <p className="text-xs text-gray-500 mt-2">
                {vin.length}/17 characters
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || vin.length !== 17}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Decoding...' : 'Decode VIN'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-gray-900 rounded-lg p-6 sm:p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6">Vehicle Details</h2>
            
            {/* Key Information */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 mb-6 border border-blue-800/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Make</p>
                  <p className="text-white text-xl font-semibold">{result.make}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Model</p>
                  <p className="text-white text-xl font-semibold">{result.model}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Year</p>
                  <p className="text-white text-xl font-semibold">{result.year}</p>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="VIN" value={result.vin} />
              <InfoItem label="Body Style" value={result.bodyStyle} />
              <InfoItem label="Trim Level" value={result.trimLevel} />
              <InfoItem label="Engine" value={result.engine} />
              <InfoItem label="Drivetrain" value={result.drivetrain} />
              <InfoItem label="Transmission" value={result.transmission} />
              <InfoItem label="Fuel Type" value={result.fuelType} />
              <InfoItem label="Vehicle Type" value={result.vehicleType} />
              <InfoItem label="Doors" value={result.doors} />
              <InfoItem label="Seats" value={result.seats} />
              <InfoItem label="Gross Vehicle Weight" value={result.grossVehicleWeight} />
              <InfoItem label="Manufacturer Location" value={result.manufacturerLocation} />
              <InfoItem label="Plant Country" value={result.plantCountry} />
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => window.print()}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Report
              </button>
              <button
                onClick={() => {
                  setVin('');
                  setResult(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Decode Another VIN
              </button>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6 sm:p-8 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">What is a VIN?</h2>
          <p className="text-gray-400 mb-4">
            A Vehicle Identification Number (VIN) is a unique 17-character code assigned to every motor vehicle when it's manufactured. The VIN provides important information about the vehicle including:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
            <li>Country of manufacture</li>
            <li>Manufacturer and brand</li>
            <li>Vehicle type and model</li>
            <li>Engine type and size</li>
            <li>Year of manufacture</li>
            <li>Assembly plant</li>
            <li>Serial number</li>
          </ul>
          <p className="text-gray-400 mt-4">
            You can find your VIN on the driver's side dashboard (visible through the windshield), driver's side door jamb, or on your vehicle registration and insurance documents.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for displaying info items
function InfoItem({ label, value }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}

export default VinDecoder;
