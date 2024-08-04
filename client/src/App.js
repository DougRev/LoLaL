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
import TopBarStatus from './components/TopBarStatus';
import Profile from './pages/Profile';

import './App.css';

const AppContent = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const [factionSelected, setFactionSelected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('App isAuthenticated:', isAuthenticated);
    console.log('App user:', user);
    console.log('App loading:', loading);

    if (!loading) {
      if (isAuthenticated) {
        if (user && !user.faction) {
          setFactionSelected(false);
          console.log('User is authenticated but has not selected a faction. Redirecting to /select-faction.');
          navigate('/select-faction');
        } else if (user && user.faction) {
          setFactionSelected(true);
        }
      } else {
        console.log('User is not authenticated. Redirecting to landing page.');
        navigate('/');
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <TopBarStatus />}
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
          <Route path="/profile" element={<Profile />} />
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
