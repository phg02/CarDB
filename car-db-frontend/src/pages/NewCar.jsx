import '../index.css';
import ProductCard from '../components/ProductCard';
import Filter from '../components/Filter';
import Result from '../components/Result';

function NewCar() {
  return (
    <div className="bg-black min-h-screen flex justify-center py-10">
      {/* This wrapper controls the whole layout width */}
      <div className="flex gap-20 w-[1200px]">   
          <Filter />

          {/* Right panel has custom width */}
          <div className="flex flex-col gap-9 w-[800px]">
            <Result count={4} />
            
            <div className="flex flex-wrap gap-x-10 gap-y-16">
              <ProductCard 
                    img="https://photo.znews.vn/w660/Uploaded/bpivptvl/2025_07_07/tesla_models_caranddriver.jpg" 
                    status="New" 
                    name="Tesla Model 3 Standard Range Plus" 
                    price="360.000.000 đ" 
                    location="Florida, USA" 
                    year={2020} 
                    wheel="Rear-wheel Drive" 
                    fuel="Electric" 
                    seats={5}/>

                  <ProductCard 
                    img="https://bmw-hanoi.com.vn/wp-content/uploads/BMW-840i-Gran-Coupe-BMW-Hanoi.com_.vn10-1.jpg" 
                    status="New" 
                    name="BMW i4 M50" 
                    price="1.200.000.000 đ" 
                    location="California, USA" 
                    year={2022} 
                    wheel="All-wheel Drive" 
                    fuel="Electric" 
                    seats={5} 
                  />

                  <ProductCard 
                    img="https://www.topgear.com/sites/default/files/cars-car/image/2025/05/Original-49014-mercedes-e53-amg-saloon-0002.jpg" 
                    status="New" 
                    name="Mercedes-Benz C-Class 300" 
                    price="900.000.000 đ" 
                    location="New York, USA" 
                    year={2021} 
                    wheel="Rear-wheel Drive" 
                    fuel="Gasoline" 
                    seats={5} 
                  />

                  <ProductCard 
                    img="https://img1.oto.com.vn/2024/12/17/OpzfnMD2/audi-a6-gia-xe-058f.webp" 
                    status="New" 
                    name="Audi e-tron GT" 
                    price="3.500.000.000 đ" 
                    location="Florida, USA" 
                    year={2023} 
                    wheel="All-wheel Drive" 
                    fuel="Electric" 
                    seats={5} 
                  />
            </div>
          </div>
      </div>
    </div>
  );
}

export default NewCar;
