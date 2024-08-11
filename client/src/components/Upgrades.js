import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import upgrades from '../config/upgradesConfig';
import './Upgrades.css';

const Upgrades = ({ onUpgradePurchase }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [kingdom, setKingdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKingdom = async () => {
      if (!isAuthenticated || !user?.kingdom?._id) return;

      try {
        const response = await axios.get(`/api/kingdoms/${user.kingdom._id}`);
        setKingdom(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching kingdom:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKingdom();
  }, [user?.kingdom, isAuthenticated]);

  const handlePurchase = async (upgradeType) => {
    if (!isAuthenticated) return;

    setError(null);
    try {
      const response = await axios.post('/api/upgrades/purchase-upgrade', { userId: user._id, upgradeType });
      setKingdom(response.data);
      console.log('Upgrade purchased:', response.data);
      onUpgradePurchase();
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while purchasing the upgrade.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const displayNames = {
    barracks: 'Barracks',
    wallFortifications: 'Wall Fortifications',
    goldProduction: 'Gold Production',
    vault: 'Vault'
  };

  const getCurrentUpgrade = (upgradeType) => {
    switch (upgradeType) {
      case 'barracks':
        return upgrades.barracks.find(upg => upg.level === kingdom.barracks.level + 1);
      case 'wallFortifications':
        return upgrades.wallFortifications.find(upg => upg.level === kingdom.wallFortifications.level + 1);
      case 'goldProduction':
        return upgrades.goldProduction.find(upg => upg.level === kingdom.goldProductionRate / 10 + 1);
      case 'vault':
        return upgrades.vault.find(upg => upg.level === (kingdom.vault?.level + 1 || 1));
      default:
        return null;
    }
  };

  const isMaxLevel = (upgradeType, currentLevel) => {
    const maxLevel = upgrades[upgradeType].length;
    return currentLevel >= maxLevel;
  };

  return (
    <div>
      <h2>Kingdom Upgrades</h2>
      <div className="upgrades-container">
        {Object.keys(upgrades).map((upgradeType) => {
          const currentUpgrade = getCurrentUpgrade(upgradeType);
          const currentLevel = kingdom[upgradeType]?.level || (upgradeType === 'goldProduction' ? kingdom.goldProductionRate / 10 : 0);
          return (
            <div key={upgradeType} className="upgrade-card" style={{ backgroundImage: `url('/images/${upgradeType}.png')` }}>
              <h3>{`${displayNames[upgradeType]} Upgrade`}</h3>
              <p>Level: {currentLevel}</p>
              {isMaxLevel(upgradeType, currentLevel) ? (
                <p>Max Level</p>
              ) : (
                currentUpgrade && (
                  <>
                    <p>Cost: {currentUpgrade.cost} Gold</p>
                    <p>{upgradeType === 'goldProduction' ? `Gold Production Bonus: ${currentUpgrade.bonus} Gold per interval` : `Bonus: ${currentUpgrade.bonus}`}</p>
                    <button onClick={() => handlePurchase(upgradeType)}>Purchase</button>
                  </>
                )
              )}
            </div>
          );
        })}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Upgrades;
