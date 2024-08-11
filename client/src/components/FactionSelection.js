import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './FactionSelection.css';

const FactionSelection = ({ setFactionSelected }) => {
  const { fetchUser } = useContext(AuthContext);
  const [factions, setFactions] = useState([]);
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFactions = async () => {
      try {
        const res = await axios.get('/api/factions');
        setFactions(res.data);
      } catch (error) {
        console.error('Error fetching factions:', error);
      }
    };

    fetchFactions();
  }, []);

  const handleFactionSelect = (faction) => {
    setSelectedFaction(faction);
    setMessage('');
  };

  const handleConfirmSelection = async () => {
    if (!selectedFaction) {
      setMessage('Please select a faction before confirming.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
      const res = await axios.post('/api/users/setFaction', { factionName: selectedFaction.name }, config);

      if (res.status === 200) {
        await fetchUser();
        setFactionSelected(true);
        navigate('/dashboard');
      } else {
        console.error('Error: Unable to set faction', res);
      }
    } catch (error) {
      console.error('Error selecting faction:', error);
    }
  };

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
      {selectedFaction && (
        <div className="faction-details-container">
          <div className="faction-details">
            <h3>{selectedFaction.name}</h3>
            <p>{selectedFaction.description}</p>
          </div>
        </div>
      )}
      <button className="faction-confirm-button" onClick={handleConfirmSelection}>
        Confirm
      </button>
      {message && <p className="faction-message">{message}</p>}
    </div>
  );
};

export default FactionSelection;
