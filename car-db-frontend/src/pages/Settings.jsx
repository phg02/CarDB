import { useState, useEffect, useRef } from 'react';
import { User, ShoppingBag, Heart, Car, LogOut, Trash2, Menu, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EditProfile from '../components/settings/EditProfile';
import PurchaseHistory from '../components/settings/PurchaseHistory';
import FavoriteList from '../components/settings/FavoriteList';
import MyListedCar from '../components/settings/MyListedCar';

const Settings = () => {
  const { auth, setAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('edit-profile');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const toastShownRef = useRef(false);

  // Check for payment status and tab on component mount
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const tab = searchParams.get('tab');

    // Only show toast once
    if (toastShownRef.current) return;

    // Handle tab parameter first (for direct navigation)
    if (tab === 'my-listed-car') {
      setActiveTab('my-listed-car');
      if (paymentStatus === 'success') {
        toast.success('Payment successful! Your car listing has been published.');
        toastShownRef.current = true;
      } else if (paymentStatus === 'failed') {
        toast.error('Payment failed. Please try again.');
        toastShownRef.current = true;
      }
      // Clear the query parameter
      setSearchParams({});
    } else if (tab === 'my-purchases') {
      setActiveTab('purchase-history');
      if (paymentStatus === 'success') {
        toast.success('Payment successful! Your purchase has been completed.');
        toastShownRef.current = true;
      } else if (paymentStatus === 'failed') {
        toast.error('Payment failed. Please try again.');
        toastShownRef.current = true;
      }
      // Clear the query parameters
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Only show edit-profile for admin users
  const isAdmin = auth?.role === 'admin';

  const menuItems = isAdmin 
    ? [{ id: 'edit-profile', label: 'Edit profile', icon: User }]
    : [
        { id: 'edit-profile', label: 'Edit profile', icon: User },
        { id: 'purchase-history', label: 'Purchase history', icon: ShoppingBag },
        { id: 'favorite-list', label: 'Favorite list', icon: Heart },
        { id: 'my-listed-car', label: 'My listed car', icon: Car },
      ];

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout request failed', err);
    }
    try { localStorage.clear(); } catch (e) {}
    try { setAuth(null); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('app:loggedOut')); } catch (e) {}
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'edit-profile':
        return <EditProfile />;
      case 'purchase-history':
        return <PurchaseHistory />;
      case 'favorite-list':
        return <FavoriteList />;
      case 'my-listed-car':
        return <MyListedCar />;
      default:
        return <EditProfile />;
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-[3px]"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>

        <div className="flex gap-4 lg:gap-8">
          {/* Left Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-[3px] overflow-hidden sticky top-8">
              <div className="p-5">
                <h1 className="text-white text-xl font-semibold mb-6">Settings</h1>
                
                {/* Menu Items */}
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[3px] transition-colors relative ${
                          isActive
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                        )}
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Section */}
              <div className="border-t border-gray-700 p-5 space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-[3px] bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              
              </div>
            </div>
          </div>

          {/* Left Sidebar - Mobile Overlay */}
          {showMobileMenu && (
            <>
              <div 
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowMobileMenu(false)}
              />
              <div className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-gray-800 z-50 overflow-y-auto">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-white text-xl font-semibold">Settings</h1>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Menu Items */}
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setShowMobileMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[3px] transition-colors relative ${
                            isActive
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                          )}
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-700 p-5 space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[3px] bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                  
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
