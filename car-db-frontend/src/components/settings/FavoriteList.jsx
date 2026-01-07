import ProductCard from '../carlisting/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

const FavoriteList = () => {
  const { auth } = useAuth();
  const [favoriteCars, setFavoriteCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!auth?.accessToken) {
        setFavoriteCars([]);
        setLoading(false);
        return;
      }

        try {
        const res = await api.get('/api/cars/watchlist', {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        const list = res.data?.data?.watchlist || [];
        // Map to the props ProductCard expects
        const mapped = list.map(c => ({
          id: c._id || c.id,
          name: c.heading || `${c.make || ''} ${c.model || ''}`.trim() || c.name,
          price: c.price ? new Intl.NumberFormat('vi-VN').format(c.price) + ' đ' : c.price || 'N/A',
          img: (c.photo_links && c.photo_links[0]) || c.heroImage || c.img || 'https://via.placeholder.com/400x300',
          status: c.inventory_type === 'new' ? 'New' : 'Used',
          location: c.dealer ? `${c.dealer.city || ''}, ${c.dealer.state || ''}, ${c.dealer.country || ''}`.replace(/^, |, $/, '') : 'Location not specified',
          year: c.year,
          wheel: c.drivetrain || c.wheel || 'Unknown',
          fuel: c.fuel_type || c.fuel || 'Unknown',
          seats: c.std_seating || c.seats || 5
        }));
        setFavoriteCars(mapped);
      } catch (err) {
        console.error('Failed to load favorites', err);
        setFavoriteCars([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth]);

  return (
    <div>
      <h2 className="text-white text-2xl font-semibold mb-6">Favorite List</h2>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : !auth?.accessToken ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Please login to view your favorites.</p>
        </div>
      ) : favoriteCars.length === 0 ? (
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
