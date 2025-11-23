import ProductCard from '../ProductCard';

const FavoriteList = () => {
  const favoriteCars = [
    {
      id: 3,
      name: 'Mercedes-Benz C-Class 300',
      price: '900.000.000 đ',
      img: 'https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg',
      status: 'New',
      location: 'New York, USA',
      year: 2021,
      wheel: 'Rear-wheel Drive',
      fuel: 'Gasoline',
      seats: 5
    },
    {
      id: 4,
      name: 'Audi e-tron GT',
      price: '3.500.000.000 đ',
      img: 'https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp',
      status: 'New',
      location: 'Florida, USA',
      year: 2023,
      wheel: 'All-wheel Drive',
      fuel: 'Electric',
      seats: 5
    },
    {
      id: 1,
      name: 'Tesla Model 3 Standard Range Plus',
      price: '360.000.000 đ',
      img: 'https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg',
      status: 'New',
      location: 'Florida, USA',
      year: 2020,
      wheel: 'Rear-wheel Drive',
      fuel: 'Electric',
      seats: 5
    }
  ];

  return (
    <div>
      <h2 className="text-white text-2xl font-semibold mb-6">Favorite List</h2>
      
      {favoriteCars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">You haven't added any favorites yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCars.map(car => (
            <ProductCard key={car.id} {...car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteList;
