const DealerInfo = ({ dealer }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Dealer Info</h3>
      
      <div className="space-y-6">
        {/* Dealer Profile */}
        <div className="flex items-center gap-4">
          {dealer.photo ? (
            <img
              src={dealer.photo}
              alt={dealer.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/30">
              <span className="text-2xl font-bold text-blue-500">{dealer.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h4 className="text-white font-semibold">{dealer.name}</h4>
            <p className="text-gray-400 text-sm">{dealer.title || 'Car Dealer'}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <a
            href={`tel:${dealer.phone}`}
            className="flex items-center gap-3 text-white hover:text-blue-500 transition-colors"
          >
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{dealer.phone}</span>
          </a>

          <a
            href={`mailto:${dealer.email}`}
            className="flex items-center gap-3 text-white hover:text-blue-500 transition-colors"
          >
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{dealer.email}</span>
          </a>
        </div>

        {/* Location */}
        {dealer.location && (
          <div className="pt-4 border-t border-gray-700">
            <h5 className="text-sm font-semibold text-white mb-2">Location</h5>
            <div className="flex gap-2 text-gray-400 text-sm">
              <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>{dealer.location}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerInfo;
