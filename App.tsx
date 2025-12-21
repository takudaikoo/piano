import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './AppDataContext';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import Home from './Home';
import AdminDashboard from './AdminDashboard';
import Login from './Login';
import Signup from './Signup';
import Checkout from './Checkout';
import OrderSuccess from './OrderSuccess';

const App = () => (
  <AppDataProvider>
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  </AppDataProvider>
);

export default App;