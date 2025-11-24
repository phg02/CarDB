import './index.css';
import AdminNavbar from './components/AdminNavbar';
import ApprovedCar from './admin-pages/ApprovedCars';
import WaitlistCar from './admin-pages/WaitlistCars';
import BoughtCars from './admin-pages/BoughtCars';
import ApprovedCarDetail from './admin-pages/ApprovedCarDetail';
import WaitlistCarDetail from './admin-pages/WaitlistCarDetail';
import BoughtCarDetail from './admin-pages/BoughtCarDetail';
import PostNews from './admin-pages/PostNews';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AdminNavbar>
        <Routes>
            <Route path="/approved-cars" element={<ApprovedCar />} />
            <Route path="/waitlist-cars" element={<WaitlistCar />} />
            <Route path="/bought-cars" element={<BoughtCars />} />
            <Route path="/approved-car/:id" element={<ApprovedCarDetail />} />
            <Route path="/waitlist-car/:id" element={<WaitlistCarDetail />} />
            <Route path="/bought-car/:id" element={<BoughtCarDetail />} />
            <Route path="/post-news" element={<PostNews />} />
        </Routes>
      </AdminNavbar>
    </BrowserRouter>
  );
}

export default App;
