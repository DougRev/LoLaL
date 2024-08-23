import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DungeonSelection from '../components/DungeonSelection';
import RegionSelection from '../components/RegionSelection';
import './Dungeons.css';

const Dungeons = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [dungeons, setDungeons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDungeon, setSelectedDungeon] = useState(null); // Track the currently selected dungeon
  const [triggerFetch, setTriggerFetch] = useState(false);

  useEffect(() => {
    const fetchEligibleRegionsAndDungeons = async () => {
      try {
        setLoading(true); // Start loading when fetching data
        const response = await axios.get('/api/dungeons/eligible', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setRegions(response.data.unlockedRegions);
        setDungeons(response.data.unlockedDungeons);
      } catch (error) {
        console.error('Error fetching regions and dungeons:', error);
        setError(error.message);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    fetchEligibleRegionsAndDungeons();
  }, [user.token, triggerFetch]);

  const handleSelectRegion = (regionId) => {
    setSelectedRegion(regionId);
  };

  const handleEnterDungeon = (dungeonId) => {
    const dungeon = dungeons.find((d) => d._id === dungeonId);
    setSelectedDungeon(dungeon);
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
    setTriggerFetch(!triggerFetch); // Toggle to trigger re-fetch
  };

  const handleBackToDungeons = async () => {
    setSelectedDungeon(null);

    try {
      await fetchUser(); // Fetch the latest user data and update the context
      setTriggerFetch(true);
    } catch (error) {
      console.error('Error fetching updated user data:', error);
      setError(error.message);
    }
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
            regionProgress={user.regionProgress} // Pass the updated regionProgress
          />
        ) : (
          <div className="dungeon-list">
            {dungeons
              .filter((dungeon) => dungeon.region.toString() === selectedRegion) // Filter dungeons for the selected region
              .map((dungeon) => (
                <div
                  key={dungeon._id}
                  className="dungeon-item"
                  style={{ backgroundImage: `url(${dungeon.image})` }}
                >
                  <span>{dungeon.name}</span>
                  <button onClick={() => handleEnterDungeon(dungeon._id)}>Enter</button>
                </div>
              ))}
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
