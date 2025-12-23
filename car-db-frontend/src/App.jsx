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
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/authComponent/PrivateRoute";
import { PublicRoute } from "./components/authComponent/PublicRoute";

// Wrapper component to conditionally render navbar based on auth role
function NavbarWrapper({ children }) {
  const { auth } = useAuth();
  
  if (auth?.role === 'admin') {
    return <AdminNavbar>{children}</AdminNavbar>;
  }
  
  return <Navbar>{children}</Navbar>;
}

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
        <Route path="*" element={<NavbarWrapper><NotFound /></NavbarWrapper>} />

        {/* Public routes - Only accessible to unauthenticated users */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <NavbarWrapper><Register /></NavbarWrapper>
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <NavbarWrapper><Login /></NavbarWrapper>
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <NavbarWrapper><ForgotPassword /></NavbarWrapper>
            </PublicRoute>
          } 
        />
        <Route 
          path="/verification-code" 
          element={
            <PublicRoute>
              <NavbarWrapper><VerificationCode /></NavbarWrapper>
            </PublicRoute>
          } 
        />
        
        {/* Common routes - Accessible to all users */}
        <Route path="/carlisting" element={<NavbarWrapper><CarListing /></NavbarWrapper>} />
        <Route path="/car/:id" element={<NavbarWrapper><CarDetails /></NavbarWrapper>} />
        <Route path="/compare" element={<NavbarWrapper><CompareCar /></NavbarWrapper>} />
        <Route path="/news" element={<NavbarWrapper><News /></NavbarWrapper>} />
        <Route path="/news/:id" element={<NavbarWrapper><NewsDetail /></NavbarWrapper>} />
        <Route path="/faq" element={<NavbarWrapper><FAQ /></NavbarWrapper>} />
        <Route path="/vin-decoder" element={<NavbarWrapper><VinDecoder /></NavbarWrapper>} />
        <Route path="/" element={<NavbarWrapper><Homepage /></NavbarWrapper>} />
        
        {/* Private routes - Only accessible to authenticated users */}
        <Route 
          path="/sellcar" 
          element={
            <PrivateRoute>
              <NavbarWrapper><SellCar /></NavbarWrapper>
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
              <NavbarWrapper><OrderForm /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ordersummary" 
          element={
            <PrivateRoute>
              <NavbarWrapper><OrderSummary /></NavbarWrapper>
            </PrivateRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <NavbarWrapper><Settings /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        
        {/* Admin routes - Only accessible to authenticated admin users */}
        <Route 
          path="/approved-cars" 
          element={
            <PrivateRoute>
              <NavbarWrapper><ApprovedCar /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/waitlist-cars" 
          element={
            <PrivateRoute>
              <NavbarWrapper><WaitlistCar /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/bought-cars" 
          element={
            <PrivateRoute>
              <NavbarWrapper><BoughtCars /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/approved-car/:id" 
          element={
            <PrivateRoute>
              <NavbarWrapper><ApprovedCarDetail /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/waitlist-car/:id" 
          element={
            <PrivateRoute>
              <NavbarWrapper><WaitlistCarDetail /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/bought-car/:id" 
          element={
            <PrivateRoute>
              <NavbarWrapper><BoughtCarDetail /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin-news" 
          element={
            <PrivateRoute>
              <NavbarWrapper><AdminNews /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/post-news" 
          element={
            <PrivateRoute>
              <NavbarWrapper><PostNews /></NavbarWrapper>
            </PrivateRoute>
          } 
        />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
