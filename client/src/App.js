import React, { useContext, useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
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
    if (!loading) {
      if (isAuthenticated) {
        if (user && !user.faction && window.location.pathname !== '/select-faction') {
          setFactionSelected(false);
          navigate('/select-faction');
        } else if (user && user.faction) {
          setFactionSelected(true);
        }
      } else {
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
          {/* The landing page is the only accessible route for non-logged-in users */}
          {isAuthenticated && (
            <>
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  {factionSelected ? <Dashboard /> : <FactionSelection setFactionSelected={setFactionSelected} />}
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dungeons" element={<Dungeons />} />
              <Route path="/battlegrounds" element={<Battlegrounds />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/select-faction" element={<FactionSelection setFactionSelected={setFactionSelected} />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            </>
          )}
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
