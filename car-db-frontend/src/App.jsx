import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import NotFound from "./pages/NotFound";
import VerificationCode from "./pages/VerificationCode";
import ForgotPassword from "./pages/ForgotPassword";

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
import PostingFeeReturn from "./pages/PostingFeeReturn";

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
import PrivateRoute from "./components/authComponent/PrivateRoute";
import { PublicRoute } from "./components/authComponent/PublicRoute";

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

        {/* Public routes - Only accessible to unauthenticated users */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Navbar><Register /></Navbar>
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Navbar><Login /></Navbar>
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <Navbar><ForgotPassword /></Navbar>
            </PublicRoute>
          } 
        />
        <Route 
          path="/verification-code" 
          element={
            <PublicRoute>
              <Navbar><VerificationCode /></Navbar>
            </PublicRoute>
          } 
        />
        
        {/* Common routes - Accessible to all users */}
        <Route path="/carlisting" element={<Navbar><CarListing /></Navbar>} />
        <Route path="/car/:id" element={<Navbar><CarDetails /></Navbar>} />
        <Route path="/compare" element={<Navbar><CompareCar /></Navbar>} />
        <Route path="/news" element={<Navbar><News /></Navbar>} />
        <Route path="/news/:id" element={<Navbar><NewsDetail /></Navbar>} />
        <Route path="/faq" element={<Navbar><FAQ /></Navbar>} />
        <Route path="/vin-decoder" element={<Navbar><VinDecoder /></Navbar>} />
        <Route path="/" element={<Navbar><Homepage /></Navbar>} />
        
        {/* Private routes - Only accessible to authenticated users */}
        <Route 
          path="/sellcar" 
          element={
            <PrivateRoute>
              <Navbar><SellCar /></Navbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/posting-fee-return" 
          element={
            <PrivateRoute>
              <Navbar><PostingFeeReturn /></Navbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/order" 
          element={
            <PrivateRoute>
              <Navbar><OrderForm /></Navbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ordersummary" 
          element={
            <PrivateRoute>
              <Navbar><OrderSummary /></Navbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Navbar><Settings /></Navbar>
            </PrivateRoute>
          } 
        />
        
        {/* Admin routes - Only accessible to authenticated admin users */}
        <Route 
          path="/approved-cars" 
          element={
            <PrivateRoute>
              <AdminNavbar><ApprovedCar /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/waitlist-cars" 
          element={
            <PrivateRoute>
              <AdminNavbar><WaitlistCar /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/bought-cars" 
          element={
            <PrivateRoute>
              <AdminNavbar><BoughtCars /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/approved-car/:id" 
          element={
            <PrivateRoute>
              <AdminNavbar><ApprovedCarDetail /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/waitlist-car/:id" 
          element={
            <PrivateRoute>
              <AdminNavbar><WaitlistCarDetail /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/bought-car/:id" 
          element={
            <PrivateRoute>
              <AdminNavbar><BoughtCarDetail /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin-news" 
          element={
            <PrivateRoute>
              <AdminNavbar><AdminNews /></AdminNavbar>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/post-news" 
          element={
            <PrivateRoute>
              <AdminNavbar><PostNews /></AdminNavbar>
            </PrivateRoute>
          } 
        />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
