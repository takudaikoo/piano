import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './AppDataContext';
import Home from './Home';
import AdminDashboard from './AdminDashboard';

const App = () => (
  <AppDataProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  </AppDataProvider>
);

export default App;