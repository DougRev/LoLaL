import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DungeonSelection from '../components/DungeonSelection';
import RegionSelection from '../components/RegionSelection';
import './Dungeons.css';

const Dungeons = () => {
  const { user } = useContext(AuthContext);
  const [dungeons, setDungeons] = useState([]);
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const regionsResponse = await axios.get('/api/dungeons/regions', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('Regions fetched:', regionsResponse.data);
        setRegions(regionsResponse.data);
      } catch (error) {
        console.error('Error fetching regions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRegions();
  }, [user.token]);
  
  useEffect(() => {
    if (selectedRegion) {
      const fetchDungeons = async () => {
        try {
          const dungeonsResponse = await axios.get(`/api/dungeons/region/${selectedRegion}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          console.log('Dungeons fetched for selected region:', dungeonsResponse.data);
          
          // Get user's progress in this region
          const highestCompleted = user.highestDungeonCompleted.find(
            (entry) => entry.regionId === selectedRegion
          );
          
          const highestCompletedLevel = highestCompleted
            ? dungeonsResponse.data.find((dungeon) => dungeon._id === highestCompleted.dungeonId)?.level || 0
            : 0;
          
          // Filter dungeons to show only those that the user can access
          const filteredDungeons = dungeonsResponse.data.filter(
            (dungeon) => dungeon.level <= highestCompletedLevel + 1
          );
          
          setDungeons(filteredDungeons);
        } catch (error) {
          console.error('Error fetching dungeons:', error);
          setError(error.message);
        }
      };
  
      fetchDungeons();
    }
  }, [selectedRegion, user.token, user.highestDungeonCompleted]);
 

  const handleSelectRegion = (regionId) => {
    console.log('Selected region ID:', regionId);
    setSelectedRegion(regionId);
    setSelectedDungeon(null);
  };


  const handleEnterDungeon = (dungeonId) => {
    const dungeon = dungeons.find((d) => d._id === dungeonId);
    console.log('Entering dungeon:', dungeon);
    setSelectedDungeon(dungeon);
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
  };

  const handleBackToDungeons = () => {
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
      {!selectedDungeon ? (
        !selectedRegion ? (
          <RegionSelection
            regions={regions}
            onSelectRegion={handleSelectRegion}
            highestRegionCompleted={user.highestRegionCompleted}
          />
        ) : (
          <div className="dungeon-list">
            {dungeons.length > 0 ? (
              dungeons.map((dungeon) => (
                <div
                  key={dungeon._id}
                  className="dungeon-item"
                  style={{ backgroundImage: `url(${dungeon.image})` }}
                >
                  <span>{dungeon.name}</span>
                  <button onClick={() => handleEnterDungeon(dungeon._id)}>Enter</button>
                </div>
              ))
            ) : (
              <p>No dungeons available in this region. Select another region.</p>
            )}
            <button onClick={handleBackToRegions}>Back to Regions</button>
          </div>
        )
      ) : (
        <DungeonSelection selectedDungeon={selectedDungeon} onBack={handleBackToDungeons} />
      )}
    </div>
  );
};

export default Dungeons;
