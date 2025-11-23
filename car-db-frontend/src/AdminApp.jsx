import './index.css';
import AdminNavbar from './components/AdminNavbar';
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AdminNavbar>
        <Routes>
        </Routes>
      </AdminNavbar>
    </BrowserRouter>
  );
}

export default App;
