import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import NotFound from "./pages/NotFound";

import CarListing from "./pages/CarListing";
import OrderSummary from "./pages/OrderSummary";
import OrderForm from "./pages/OrderForm";
import CarDetails from "./pages/CarDetails";
import CompareCar from "./pages/CompareCar";
import SellCar from "./pages/SellCar";
import Settings from "./pages/Settings";
import Navbar from "./components/common/Navbar";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import FAQ from "./pages/FAQ";
import Homepage from "./pages/Homepage";
import VinDecoder from "./pages/VinDecoder";

import AdminNavbar from './components/admin/AdminNavbar';
import ApprovedCar from './admin-pages/ApprovedCars';
import WaitlistCar from './admin-pages/WaitlistCars';
import BoughtCars from './admin-pages/BoughtCars';
import ApprovedCarDetail from './admin-pages/ApprovedCarDetail';
import WaitlistCarDetail from './admin-pages/WaitlistCarDetail';
import BoughtCarDetail from './admin-pages/BoughtCarDetail';
import AdminNews from './admin-pages/AdminNews';
import PostNews from './admin-pages/PostNews';
import {Register} from "./pages/Register";
import {Login} from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path="*" element={<Navbar><NotFound /></Navbar>} />

        {/* Public routes without navbar */}
        <Route path="/register" element={<Navbar><Register /></Navbar>} />
        <Route path="/login" element={<Navbar><Login /></Navbar>} />
        
        {/* User routes with navbar */}
        <Route path="/carlisting" element={<Navbar><CarListing /></Navbar>} />
        <Route path="/car/:id" element={<Navbar><CarDetails /></Navbar>} />
        <Route path="/compare" element={<Navbar><CompareCar /></Navbar>} />
        <Route path="/sellcar" element={<Navbar><SellCar /></Navbar>} />
        <Route path="/order" element={<Navbar><OrderForm /></Navbar>} />
        <Route path="/ordersummary" element={<Navbar><OrderSummary /></Navbar>} />
        <Route path="/settings" element={<Navbar><Settings /></Navbar>} />
        <Route path="/news" element={<Navbar><News /></Navbar>} />
        <Route path="/news/:id" element={<Navbar><NewsDetail /></Navbar>} />
        <Route path="/faq" element={<Navbar><FAQ /></Navbar>} />
        <Route path="/vin-decoder" element={<Navbar><VinDecoder /></Navbar>} />
        <Route path="/" element={<Navbar><Homepage /></Navbar>} />
        
        {/* Admin routes with admin navbar */}
        <Route path="/approved-cars" element={<AdminNavbar><ApprovedCar /></AdminNavbar>} />
        <Route path="/waitlist-cars" element={<AdminNavbar><WaitlistCar /></AdminNavbar>} />
        <Route path="/bought-cars" element={<AdminNavbar><BoughtCars /></AdminNavbar>} />
        <Route path="/approved-car/:id" element={<AdminNavbar><ApprovedCarDetail /></AdminNavbar>} />
        <Route path="/waitlist-car/:id" element={<AdminNavbar><WaitlistCarDetail /></AdminNavbar>} />
        <Route path="/bought-car/:id" element={<AdminNavbar><BoughtCarDetail /></AdminNavbar>} />
        <Route path="/admin-news" element={<AdminNavbar><AdminNews /></AdminNavbar>} />
        <Route path="/post-news" element={<AdminNavbar><PostNews /></AdminNavbar>} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
