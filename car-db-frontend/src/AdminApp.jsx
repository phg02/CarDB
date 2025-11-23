import './index.css';
import AdminNavbar from './components/AdminNavbar';
import ApprovedCar from './admin-pages/ApprovedCars';
import WaitlistCar from './admin-pages/WaitlistCars';
import BoughtCar from './admin-pages/BoughtCars';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AdminNavbar>
        <Routes>
            <Route path="/approved-cars" element={<ApprovedCar />} />
            <Route path="/waitlist-cars" element={<WaitlistCar />} />
            <Route path="/bought-cars" element={<BoughtCar />} />
        </Routes>
      </AdminNavbar>
    </BrowserRouter>
  );
}

export default App;
