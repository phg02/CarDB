import './index.css';
import NewCar from './pages/NewCar';
import UsedCar from './pages/UsedCar';
import OrderSummary from './pages/OrderSummary';
import OrderForm from './pages/OrderForm';
import CarDetails from './pages/CarDetails';
import CompareCar from './pages/CompareCar';
import Navbar from './components/Navbar';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Navbar>
        <Routes>
          <Route path="/" element={<OrderSummary />} />
          <Route path="/newcar" element={<NewCar />} />
          <Route path="/usedcar" element={<UsedCar />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/order" element={<OrderForm />} />
          <Route path="/ordersummary" element={<OrderSummary />} />
          <Route path="/compare" element={<CompareCar />} />
        </Routes>
      </Navbar>
    </BrowserRouter>
  );
}

export default App;
