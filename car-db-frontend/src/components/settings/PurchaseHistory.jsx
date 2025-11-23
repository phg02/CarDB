import ProductCard from '../ProductCard';

const PurchaseHistory = () => {
  const purchasedCars = [
    {
      id: 1,
      name: 'Tesla Model 3 Standard Range Plus',
      price: '360.000.000 đ',
      img: 'https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg',
      status: 'Purchased Jan 15, 2024',
      location: 'Florida, USA',
      year: 2020,
      wheel: 'Rear-wheel Drive',
      fuel: 'Electric',
      seats: 5
    },
    {
      id: 2,
      name: 'BMW i4 M50',
      price: '1.200.000.000 đ',
      img: 'https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg',
      status: 'Purchased Dec 20, 2023',
      location: 'California, USA',
      year: 2022,
      wheel: 'All-wheel Drive',
      fuel: 'Electric',
      seats: 5
    }
  ];

  return (
    <div>
      <h2 className="text-white text-2xl font-semibold mb-6">Purchase History</h2>
      
      {purchasedCars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">You haven't purchased any cars yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCars.map(car => (
            <ProductCard key={car.id} {...car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
