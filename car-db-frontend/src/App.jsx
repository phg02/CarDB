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
        </Routes>
      </Navbar>
    </BrowserRouter>
  );
}

export default App;
