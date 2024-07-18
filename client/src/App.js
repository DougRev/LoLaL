import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated && <Navbar />}
      <div className={`content ${isAuthenticated ? 'authenticated' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
