import '../index.css';
import { useEffect, useState } from 'react';
import ProductCard from '../components/carlisting/ProductCard';
import Result from '../components/carlisting/Result';
import DeliveredFilter from '../components/admin/DeliveredFilter';

const initialCars = [
  {
    id: 1,
    to: `/bought-car/1`,
    img: 'https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg',
    statusLabel: 'New',
    name: 'Tesla Model 3 Standard Range Plus',
    price: '360.000.000 đ',
    location: 'Florida, USA',
    year: 2020,
    wheel: 'Rear-wheel Drive',
    fuel: 'Electric',
    seats: 5,
  },
  {
    id: 2,
    to: `/bought-car/2`,
    img: 'https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg',
    statusLabel: 'Used',
    name: 'BMW i4 M50',
    price: '1.200.000.000 đ',
    location: 'California, USA',
    year: 2022,
    wheel: 'All-wheel Drive',
    fuel: 'Electric',
    seats: 5,
  },
  {
    id: 3,
    to: `/bought-car/3`,
    img: 'https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg',
    statusLabel: 'New',
    name: 'Mercedes-Benz C-Class 300',
    price: '900.000.000 đ',
    location: 'New York, USA',
    year: 2021,
    wheel: 'Rear-wheel Drive',
    fuel: 'Gasoline',
    seats: 5,
  },
  {
    id: 4,
    to: `/bought-car/4`,
    img: 'https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp',
    statusLabel: 'Used',
    name: 'Audi e-tron GT',
    price: '3.500.000.000 đ',
    location: 'Florida, USA',
    year: 2023,
    wheel: 'All-wheel Drive',
    fuel: 'Electric',
    seats: 5,
  },
];

function BoughtCars() {
  const [cars, setCars] = useState(initialCars);

  useEffect(() => {
    // Load stored delivery statuses and apply to cars
    try {
      const store = JSON.parse(localStorage.getItem('boughtCarsStatus') || '{}');
      if (store && Object.keys(store).length) {
        setCars(prev => prev.map(c => ({ ...c, delivered: store[c.id] || 'Not Delivered' })));
      } else {
        setCars(prev => prev.map(c => ({ ...c, delivered: 'Not Delivered' })));
      }
    } catch (e) {
      setCars(prev => prev.map(c => ({ ...c, delivered: 'Not Delivered' })));
    }
  }, []);

  const updateStatus = (id, status) => {
    setCars(prev => prev.map(c => c.id === id ? { ...c, delivered: status } : c));
    try {
      const store = JSON.parse(localStorage.getItem('boughtCarsStatus') || '{}');
      store[id] = status;
      localStorage.setItem('boughtCarsStatus', JSON.stringify(store));
    } catch (err) {
      localStorage.setItem('boughtCarsStatus', JSON.stringify({ [id]: status }));
    }
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
      {/* This wrapper controls the whole layout width */}
      <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <DeliveredFilter />

          {/* Right panel has custom width */}
          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={cars.length} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              {cars.map(car => {
                const isDelivered = car.delivered === 'Delivered';
                const btnClass = `w-full py-2 ${isDelivered ? 'text-green-400 border border-green-400' : 'text-yellow-400 border border-yellow-400'} rounded text-center`;
                return (
                  <ProductCard
                    key={car.id}
                    id={car.id}
                    to={car.to}
                    img={car.img}
                    status={car.statusLabel}
                    name={car.name}
                    price={car.price}
                    location={car.location}
                    year={car.year}
                    wheel={car.wheel}
                    fuel={car.fuel}
                    seats={car.seats}
                  >
                    <div className={btnClass}>
                      {car.delivered || 'Not Delivered'}
                    </div>
                  </ProductCard>
                );
              })}
            </div>
          </div>
      </div>
    </div>
  );
}

export default BoughtCars;
