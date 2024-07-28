import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DungeonSelection from '../components/DungeonSelection';

const Dungeons = () => {
  const { user } = useContext(AuthContext);
  const [dungeons, setDungeons] = useState([]);
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDungeons = async () => {
      try {
        const response = await axios.get('/api/dungeons');
        setDungeons(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dungeons:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDungeons();
  }, []);

  const handleEnterDungeon = (dungeonId) => {
    const dungeon = dungeons.find(d => d._id === dungeonId);
    setSelectedDungeon(dungeon);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Dungeons</h2>
      {!selectedDungeon ? (
        <ul>
          {dungeons.map(dungeon => (
            <li key={dungeon._id}>
              {dungeon.name} - {dungeon.description}
              <button onClick={() => handleEnterDungeon(dungeon._id)}>Enter</button>
            </li>
          ))}
        </ul>
      ) : (
        <DungeonSelection dungeons={dungeons} selectedDungeon={selectedDungeon} />
      )}
    </div>
  );
};

export default Dungeons;
