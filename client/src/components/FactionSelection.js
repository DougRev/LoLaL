import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FactionSelection = ({ setFactionSelected }) => {
  const { fetchUser } = useContext(AuthContext);
  const [factions, setFactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFactions = async () => {
      try {
        const res = await axios.get('/api/users/factions');
        setFactions(res.data);
      } catch (error) {
        console.error('Error fetching factions:', error);
      }
    };

    fetchFactions();
  }, []);

  const handleFactionSelect = async (faction) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token, 'Content-Type': 'application/json' } };
      const res = await axios.post('/api/users/setFaction', { factionName: faction.name }, config);
  
      if (res.status === 200) {
        await fetchUser(); // Refresh user data after selecting faction
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
    <div>
      <h2>Select Your Faction</h2>
      <ul>
        {factions.map((faction) => (
          <li key={faction.name}>
            <button onClick={() => handleFactionSelect(faction)}>
              {faction.name}: {faction.description}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FactionSelection;
