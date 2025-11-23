import '../index.css';
import ProductCard from '../components/ProductCard';
import Filter from '../components/Filter';
import Result from '../components/Result';

function WaitlistCar() {
  return (
    <div className="bg-black min-h-screen flex flex-col items-center py-6 px-4 sm:py-10">
      
      {/* This wrapper controls the whole layout width */}
      <div className="flex flex-col lg:flex-row lg:gap-20 w-full max-w-[1200px]">
          <Filter />

          {/* Right panel has custom width */}
          <div className="flex flex-col gap-6 sm:gap-9 py-5 lg:py-0 w-full lg:flex-1">
            <Result count={4} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1400px]:grid-cols-3 gap-6 sm:gap-8 auto-rows-fr">
              <ProductCard
                    id={1}
                    img="https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg" 
                    status="New" 
                    name="Tesla Model 3 Standard Range Plus" 
                    price="360.000.000 đ" 
                    location="Florida, USA" 
                    year={2020} 
                    wheel="Rear-wheel Drive" 
                    fuel="Electric" 
                    seats={5}>

                    <div className="flex gap-2">
                      <button className="w-full py-2 text-blue-400 border border-blue-400 rounded hover:bg-blue-500 hover:text-white transition">
                        Approve
                      </button>
                      <button className="w-full py-2 text-red-400 border border-red-400 rounded hover:bg-red-500 hover:text-white transition">
                        Delete
                      </button>
                    </div> 
              </ProductCard>

              <ProductCard
                    id={2}
                    img="https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg" 
                    status="Used" 
                    name="BMW i4 M50" 
                    price="1.200.000.000 đ" 
                    location="California, USA" 
                    year={2022} 
                    wheel="All-wheel Drive" 
                    fuel="Electric" 
                    seats={5}>

                    <div className="flex gap-2">
                      <button className="w-full py-2 text-blue-400 border border-blue-400 rounded hover:bg-blue-500 hover:text-white transition">
                        Approve
                      </button>
                      <button className="w-full py-2 text-red-400 border border-red-400 rounded hover:bg-red-500 hover:text-white transition">
                        Delete
                      </button>
                    </div> 
              </ProductCard>

              <ProductCard
                    id={3}
                    img="https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg" 
                    status="New" 
                    name="Mercedes-Benz C-Class 300" 
                    price="900.000.000 đ" 
                    location="New York, USA" 
                    year={2021} 
                    wheel="Rear-wheel Drive" 
                    fuel="Gasoline" 
                    seats={5}>

                    <div className="flex gap-2">
                      <button className="w-full py-2 text-blue-400 border border-blue-400 rounded hover:bg-blue-500 hover:text-white transition">
                        Approve
                      </button>
                      <button className="w-full py-2 text-red-400 border border-red-400 rounded hover:bg-red-500 hover:text-white transition">
                        Delete
                      </button>
                    </div> 
              </ProductCard>

                  <ProductCard
                    id={4}
                    img="https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp" 
                    status="Used" 
                    name="Audi e-tron GT" 
                    price="3.500.000.000 đ" 
                    location="Florida, USA" 
                    year={2023} 
                    wheel="All-wheel Drive" 
                    fuel="Electric" 
                    seats={5}>

                    <div className="flex gap-2">
                      <button className="w-full py-2 text-blue-400 border border-blue-400 rounded hover:bg-blue-500 hover:text-white transition">
                        Approve
                      </button>
                      <button className="w-full py-2 text-red-400 border border-red-400 rounded hover:bg-red-500 hover:text-white transition">
                        Delete
                      </button>
                    </div> 
              </ProductCard>
            </div>
          </div>
      </div>
    </div>
  );
}

export default WaitlistCar;
