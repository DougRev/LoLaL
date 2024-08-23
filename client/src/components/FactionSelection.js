import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './FactionSelection.css';

const FactionSelection = ({ setFactionSelected }) => {
  const { fetchUser, isAuthenticated } = useContext(AuthContext);
  const [factions, setFactions] = useState([]);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [message, setMessage] = useState('Select a faction to see more details.');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchFactions = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/factions');
        setFactions(res.data);
      } catch (error) {
        console.error('Error fetching factions:', error);
        setMessage('Error loading factions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFactions();
  }, [isAuthenticated, navigate]);

  const handleFactionSelect = useCallback((faction) => {
    setSelectedFaction(faction);
    setMessage(`You have selected the ${faction.name}. ${faction.description}`);
  }, []);

  const handleConfirmSelection = useCallback(async () => {
    if (!selectedFaction) {
      setMessage('Please select a faction before confirming.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
      const res = await axios.post('/api/users/set-Faction', { factionName: selectedFaction.name }, config);

      if (res.status === 200) {
        await fetchUser();
        setFactionSelected(true);
        navigate('/dashboard');
      } else {
        console.error('Error: Unable to set faction', res);
        setMessage('Unable to set faction. Please try again.');
      }
    } catch (error) {
      console.error('Error selecting faction:', error);
      setMessage('Error selecting faction. Please try again.');
    }
  }, [selectedFaction, fetchUser, navigate, setFactionSelected]);

  if (loading) {
    return <div>Loading factions...</div>;
  }

  return (
    <div className="faction-selection-container">
      <h2 className="faction-selection-title">Select Your Faction</h2>
      <div className="faction-cards">
        {factions.map((faction) => (
          <div
            className={`faction-card ${selectedFaction === faction ? 'selected' : ''}`}
            key={faction.name}
            onClick={() => handleFactionSelect(faction)}
            style={{ backgroundImage: `url(${faction.image})` }}
          >
            <div className="faction-overlay" />
            <div className="faction-name">{faction.name}</div>
          </div>
        ))}
      </div>
      <div className="faction-details-container">
        <h3>{selectedFaction ? selectedFaction.name : "Choose Your Side"}</h3>
        <p>
          {selectedFaction
            ? selectedFaction.description
            : "A great war is upon us! Choose your faction and lead your people to glory. Select one of the banners above to join the conflict."}
        </p>
        <button className="faction-confirm-button" onClick={handleConfirmSelection}>
          Confirm
        </button>
      </div>
      {message && <p className={selectedFaction ? "faction-selected-message" : "faction-message"}>{message}</p>}
    </div>
  );
};

export default FactionSelection;
