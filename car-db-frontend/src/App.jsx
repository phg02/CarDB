import "./index.css";

import CarListing from "./pages/CarListing";
import OrderSummary from "./pages/OrderSummary";
import OrderForm from "./pages/OrderForm";
import CarDetails from "./pages/CarDetails";
import CompareCar from "./pages/CompareCar";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import FAQ from "./pages/FAQ";
import Homepage from "./pages/Homepage";

import AdminNavbar from './components/AdminNavbar';
import ApprovedCar from './admin-pages/ApprovedCars';
import WaitlistCar from './admin-pages/WaitlistCars';
import BoughtCars from './admin-pages/BoughtCars';
import ApprovedCarDetail from './admin-pages/ApprovedCarDetail';
import WaitlistCarDetail from './admin-pages/WaitlistCarDetail';
import BoughtCarDetail from './admin-pages/BoughtCarDetail';
import PostNews from './admin-pages/PostNews';

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar>
        <Routes>
          <Route path="/carlisting" element={<CarListing />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/compare" element={<CompareCar />} />
          <Route path="/order" element={<OrderForm />} />
          <Route path="/ordersummary" element={<OrderSummary />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/" element={<Homepage />} />
        </Routes>
      </Navbar>

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
