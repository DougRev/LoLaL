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
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const fetchRegionsAndDungeons = async () => {
      try {
        const regionsResponse = await axios.get('/api/dungeons/regions', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('Regions fetched:', regionsResponse.data);

        const dungeonsResponse = await axios.get('/api/dungeons', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log('Dungeons fetched:', dungeonsResponse.data);

        setRegions(regionsResponse.data);
        setDungeons(dungeonsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionsAndDungeons();
  }, [user.token]);

  const handleSelectRegion = (regionId) => {
    console.log('Selected region ID:', regionId);
    setSelectedRegion(regionId);
    setSelectedDungeon(null); // Reset selected dungeon when region changes
  };

  const filteredDungeons = selectedRegion
    ? dungeons.filter((dungeon) => {
        console.log(`Dungeon region: ${dungeon.region._id}, Selected region: ${selectedRegion}`);
        return dungeon.region && dungeon.region._id === selectedRegion;
      })
    : [];

  useEffect(() => {
    console.log('Filtered dungeons:', filteredDungeons);
  }, [filteredDungeons]);

  const handleEnterDungeon = (dungeonId) => {
    const dungeon = dungeons.find((d) => d._id === dungeonId);
    console.log('Entering dungeon:', dungeon);
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
      {!selectedDungeon ? (
        <div>
          {!selectedRegion ? (
            <div className="region-list">
              {regions.length > 0 ? (
                regions.map((region) => {
                  const regionBackgroundImage = `/images/regions/${region.name.replace(/\s+/g, '_').toLowerCase()}.png`;
                  return (
                    <div
                      key={region._id}
                      className="region-item"
                      style={{ backgroundImage: `url(${regionBackgroundImage})` }}
                      onClick={() => handleSelectRegion(region._id)}
                    >
                      <span>{region.name}</span>
                    </div>
                  );
                })
              ) : (
                <p>No regions available.</p>
              )}
            </div>
          ) : (
            <div className="dungeon-list">
              {filteredDungeons.length > 0 ? (
                filteredDungeons.map((dungeon) => {
                  const dungeonImageName = dungeon.name.replace(/\s+/g, '_').toLowerCase();
                  const backgroundImage = `images/regions/dungeons/${dungeonImageName}.png`;
                  return (
                    <div
                      key={dungeon._id}
                      className="dungeon-item"
                      style={{ backgroundImage: `url(${backgroundImage})` }}
                    >
                      <span>{dungeon.name}</span>
                      <button onClick={() => handleEnterDungeon(dungeon._id)}>Enter</button>
                    </div>
                  );
                })
              ) : (
                <p>No dungeons available in this region. Select another region.</p>
              )}
              <button onClick={() => setSelectedRegion(null)}>Back to Regions</button>
            </div>
          )}
        </div>
      ) : (
        <DungeonSelection selectedDungeon={selectedDungeon} onBack={handleBack} />
      )}
    </div>
  );
};

export default Dungeons;
