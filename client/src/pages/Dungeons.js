import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DungeonSelection from '../components/DungeonSelection';
import './Dungeons.css';

const Dungeons = () => {
  const { user } = useContext(AuthContext);
  const [dungeons, setDungeons] = useState([]);
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDungeons = async () => {
      try {
        const response = await axios.get('/api/dungeons', { headers: { 'Authorization': `Bearer ${user.token}` } });
        setDungeons(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dungeons:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDungeons();
  }, [user.token]);

  const handleEnterDungeon = (dungeonId) => {
    const dungeon = dungeons.find(d => d._id === dungeonId);
    setSelectedDungeon(dungeon);
  };

  const handleBack = () => {
    setSelectedDungeon(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dungeons-page">
      <h2>Dungeons</h2>
      {!selectedDungeon ? (
        <div className="dungeon-list">
          {dungeons.length > 0 ? (
            dungeons.map(dungeon => (
              <div key={dungeon._id} className="dungeon-item">
                <span>{dungeon.name} {dungeon.description}</span>
                <button onClick={() => handleEnterDungeon(dungeon._id)}>Enter</button>
              </div>
            ))
          ) : (
            <p>No dungeons available. Complete existing dungeons to unlock more.</p>
          )}
        </div>
      ) : (
        <DungeonSelection selectedDungeon={selectedDungeon} onBack={handleBack} />
      )}
    </div>
  );
};

export default Dungeons;
