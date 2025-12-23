import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppDataProvider } from './AppDataContext';
import { CartProvider } from './CartContext';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './Home';
import AdminDashboard from './AdminDashboard';
import MyPage from './MyPage';
import Login from './Login';
import Signup from './Signup';
import Checkout from './Checkout';
import OrderSuccess from './OrderSuccess';
import ProfileSetup from './ProfileSetup';
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!loading && user) {
        // Check if user has nickname
        const { data, error } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();

        if (!data?.nickname && location.pathname !== '/setup-profile') {
          navigate('/setup-profile');
        }
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [user, loading, navigate, location.pathname]);

  if (loading || checkingProfile) return <div>Loading...</div>;
  return children;
};

const App = () => (
  <AppDataProvider>
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/mypage" element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/setup-profile" element={<ProfileSetup />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  </AppDataProvider>
);


export default App;