const CarPriceActions = ({ price }) => {
  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400 mb-2">Price</p>
          <p className="text-3xl font-bold text-blue-500">{price}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex items-center justify-center">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            BUY
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarPriceActions;
