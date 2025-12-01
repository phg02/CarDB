import { Link, useLocation } from 'react-router-dom';

const CarHeroSection = ({ carName, heroImage }) => {
  const { pathname } = useLocation();

  // Determine breadcrumb based on route. For admin detail routes we point to admin lists.
  const isApproved = pathname.startsWith('/approved-car');
  const isWaitlist = pathname.startsWith('/waitlist-car');
  const isBought = pathname.startsWith('/bought-car');

  const listLink = isApproved
    ? { to: '/approved-cars', label: 'Approved Cars' }
    : isWaitlist
      ? { to: '/waitlist-cars', label: 'Waitlist Cars' }
      : isBought
        ? { to: '/bought-cars', label: 'Bought Cars' }
        : { to: '/carlisting', label: 'Car Listing' };

  return (
    <section className="relative w-full">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">Homepage</Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <Link to={listLink.to} className="hover:text-white transition-colors">{listLink.label}</Link>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <span className="text-white">Car Detail</span>
        </nav>
      </div>

      {/* Title Section */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">{carName}</h1>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[600px] overflow-hidden pb-12">
        <img src={heroImage} alt={carName} className="w-full h-full object-cover" />
      </div>
    </section>
  );
};

export default CarHeroSection;
