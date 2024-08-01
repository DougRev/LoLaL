import React, { useContext, useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import FactionSelection from './components/FactionSelection';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Battlegrounds from './pages/Battlegrounds';
import Dungeons from './pages/Dungeons';

import './App.css';

const AppContent = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const [factionSelected, setFactionSelected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && !user.faction) {
      setFactionSelected(false);
      navigate('/select-faction');
    } else if (isAuthenticated && user && user.faction) {
      setFactionSelected(true);
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      <div className={`content ${isAuthenticated ? 'authenticated' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={factionSelected ? <Dashboard /> : <FactionSelection setFactionSelected={setFactionSelected} />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dungeons" element={<Dungeons />} />
          <Route path="/battlegrounds" element={<Battlegrounds />} />
          <Route path="/select-faction" element={<FactionSelection setFactionSelected={setFactionSelected} />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
