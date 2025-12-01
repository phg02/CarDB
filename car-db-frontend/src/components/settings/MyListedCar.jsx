import ProductCard from '../carlisting/ProductCard';

const MyListedCar = () => {
  const listedCars = [
    {
      id: 2,
      name: 'BMW i4 M50',
      price: '1.200.000.000 đ',
      img: 'https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg',
      status: 'Active - Listed 12 days ago',
      location: 'California, USA',
      year: 2022,
      wheel: 'All-wheel Drive',
      fuel: 'Electric',
      seats: 5
    },
    {
      id: 4,
      name: 'Audi e-tron GT',
      price: '3.500.000.000 đ',
      img: 'https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp',
      status: 'Pending - Listed 5 days ago',
      location: 'Florida, USA',
      year: 2023,
      wheel: 'All-wheel Drive',
      fuel: 'Electric',
      seats: 5
    }
  ];

  return (
    <div>
      <h2 className="text-white text-2xl font-semibold mb-6">My Listed Cars</h2>
      
      {listedCars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">You haven't listed any cars for sale yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listedCars.map(car => (
            <ProductCard key={car.id} {...car} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListedCar;
