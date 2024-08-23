import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Upgrades.css';

const Upgrades = ({ onUpgradePurchase }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [kingdom, setKingdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insufficientGold, setInsufficientGold] = useState(null);
  const [upgradeDetails, setUpgradeDetails] = useState({});

  const displayNames = {
    barracks: 'Barracks',
    wallFortifications: 'Wall Fortifications',
    goldProduction: 'Gold Production',
    vault: 'Vault'
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user?.kingdom?._id) return;

      try {
        // Fetch kingdom data
        const kingdomResponse = await axios.get(`/api/kingdoms/${user.kingdom._id}`);
        const fetchedKingdom = kingdomResponse.data;
        setKingdom(fetchedKingdom);

        // Fetch upgrade details
        fetchUpgradeDetails(fetchedKingdom);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.kingdom, isAuthenticated]);

  const fetchUpgradeDetails = async (fetchedKingdom) => {
    try {
      const details = {};
      for (let upgradeType of Object.keys(displayNames)) {
        const currentLevel = fetchedKingdom[upgradeType]?.level || (upgradeType === 'goldProduction' ? fetchedKingdom.goldProductionRate / 10 : 0);
        const upgradeResponse = await axios.get(`/api/upgrades/next?upgradeType=${upgradeType}&level=${currentLevel}`);
        details[upgradeType] = upgradeResponse.data;
      }
      setUpgradeDetails(details);
    } catch (error) {
      console.error('Error fetching upgrade details:', error);
      setError('Failed to fetch upgrade details.');
    }
  };

  const handlePurchase = async (upgradeType) => {
    try {
      const response = await axios.post('/api/upgrades/purchase', { userId: user._id, upgradeType });
      setKingdom(response.data); // Update local kingdom state
      setInsufficientGold(null); // Reset insufficient gold state
      onUpgradePurchase(); // Trigger additional updates, including global state

      // Fetch the updated upgrade details
      fetchUpgradeDetails(response.data); // Pass the updated kingdom data
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.requiredGold) {
        setInsufficientGold({
          message: error.response.data.message,
          requiredGold: error.response.data.requiredGold,
        });
      } else {
        console.error('Error purchasing upgrade:', error);
        setError(error.response?.data?.message || 'An error occurred while purchasing the upgrade.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const isMaxLevel = (upgradeType) => {
    return !upgradeDetails[upgradeType]; // If no upgrade details are available, it's likely at max level
  };

  return (
    <div>
      <h2>Kingdom Upgrades</h2>
      <div className="upgrades-container">
        {Object.keys(displayNames).map((upgradeType) => {
          const currentLevel = kingdom[upgradeType]?.level || (upgradeType === 'goldProduction' ? kingdom.goldProductionRate / 10 : 0);
          const currentUpgrade = upgradeDetails[upgradeType];
          return (
            <div key={upgradeType} className="upgrade-card" style={{ backgroundImage: `url('/images/${upgradeType}.png')` }}>
              <h3>{`${displayNames[upgradeType]} Upgrade`}</h3>
              <p>Level: {currentLevel}</p>
              {isMaxLevel(upgradeType) ? (
                <p>Max Level</p>
              ) : currentUpgrade ? (
                <>
                  <p>Cost: {currentUpgrade.cost} Gold</p>
                  <p>{upgradeType === 'goldProduction' ? `Gold Production Bonus: ${currentUpgrade.bonus}` : `Bonus: ${currentUpgrade.bonus}`}</p>
                  <button onClick={() => handlePurchase(upgradeType)}>Purchase</button>
                </>
              ) : (
                <p>Loading upgrade details...</p>
              )}
            </div>
          );
        })}
      </div>
      {insufficientGold && (
        <div className="error-message">
          {insufficientGold.message}. You need {insufficientGold.requiredGold} gold for this upgrade.
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Upgrades;
