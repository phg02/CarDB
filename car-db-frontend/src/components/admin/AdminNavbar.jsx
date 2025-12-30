import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import{ NavLink } from 'react-router-dom';
import Footer from '../common/Footer';
import Chatbot from '../common/Chatbot';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import axios from 'axios';

const navigation = [
  { name: 'Approved Cars', href: '/approved-cars' },
  { name: 'Waitlist Cars', href: '/waitlist-cars' },
  { name: 'Sold Cars', href: '/bought-cars' },
  { name: 'News', href: '/admin-news' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminNavbar(props) {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
      try { localStorage.clear(); } catch (e) {}
      setAuth(null);
      try { window.dispatchEvent(new CustomEvent('app:loggedOut')); } catch (e) {}
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local auth state
      try { localStorage.clear(); } catch (e) {}
      setAuth(null);
      try { window.dispatchEvent(new CustomEvent('app:loggedOut')); } catch (e) {}
      navigate('/login');
    }
  };
  return (
    <>
    <div className="min-h-screen flex flex-col">
    <Disclosure
      as="nav"
      className="relative bg-gray-800 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="CarDB Logo"
                src={logo}
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({isActive}) => {
                        return `text-white rounded-md px-3 py-2 text-sm font-medium` + (isActive ? 'bg-gray-900 text-white bg-gray-950/50' : 'text-gray-300 hover:bg-white/5 hover:text-white');
                    }}
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

            {/* Profile */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">                
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-semibold overflow-hidden outline -outline-offset-1 outline-white/10">
                  {auth?.profileImage ? (
                    <img
                      alt="Profile"
                      src={auth.profileImage}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    auth?.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
              </MenuButton>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <MenuItem>
                  <NavLink
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Settings
                  </NavLink>
                </MenuItem>
                <MenuItem>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>

          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <NavLink
                key={item.name}
                to={item.href}
                className={({isActive}) => {
                    return `block text-white rounded-md px-3 py-2 text-base font-medium` + (isActive ? 'bg-gray-900 text-white bg-gray-950/50' : 'text-gray-300 hover:bg-white/5 hover:text-white');
                }}
            >
                {item.name}
            </NavLink>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
    <main className="flex-grow">
      {props.children}
    </main>
    <Footer />
    </div>
    </>
  );
}
