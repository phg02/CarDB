import { Link } from 'react-router-dom';

const CarHeroSection = ({ carName, heroImage }) => {
  return (
    <section className="relative w-full">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">
            Homepage
          </Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/newcar" className="hover:text-white transition-colors">
            New Car List
          </Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white">Car Detail</span>
        </nav>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <img
          src={heroImage}
          alt={carName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title Section */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {carName}
        </h1>
      </div>
    </section>
  );
};

export default CarHeroSection;
