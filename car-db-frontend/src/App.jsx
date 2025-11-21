import './index.css';
import NewCar from './pages/NewCar';
import UsedCar from './pages/UsedCar';
import OrderSummary from './pages/OrderSummary';
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
        </Routes>
      </Navbar>
    </BrowserRouter>
  );
}

export default App;
