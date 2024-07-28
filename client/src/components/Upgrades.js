import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import upgrades from '../config/upgradesConfig';  // Adjust the path as needed

const Upgrades = ({ onUpgradePurchase }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [kingdom, setKingdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKingdom = async () => {
      if (!isAuthenticated || !user?.kingdom?._id) return; // Ensure user is authenticated and kingdom exists

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
    if (!isAuthenticated) return; // Ensure user is authenticated

    setError(null); // Clear previous errors
    try {
      const response = await axios.post('/api/upgrades/purchase-upgrade', { userId: user._id, upgradeType });
      setKingdom(response.data);
      console.log('Upgrade purchased:', response.data);
      onUpgradePurchase(); // Trigger parent component to update
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

  const currentBarracksUpgrade = upgrades.barracks.find(upg => upg.level === kingdom.barracks.level + 1);
  const currentWallUpgrade = upgrades.wallFortifications.find(upg => upg.level === kingdom.wallFortifications.level + 1);
  const currentGoldProductionUpgrade = upgrades.goldProduction.find(upg => upg.level === kingdom.goldProductionRate / 10);
  const currentVaultUpgrade = {
    level: kingdom.vault?.level + 1 || 1,
    cost: (kingdom.vault?.level + 1 || 1) * 1000,
    capacity: (kingdom.vault?.capacity + (kingdom.vault?.level + 1 || 1) * 500) || 500,
  };

  return (
    <div>
      <h2>Kingdom Upgrades</h2>
      <div>
        <h3>Barracks Upgrade</h3>
        {currentBarracksUpgrade ? (
          <div>
            <p>Level: {currentBarracksUpgrade.level}</p>
            <p>Cost: {currentBarracksUpgrade.cost} Gold</p>
            <p>Offensive Bonus: {currentBarracksUpgrade.bonus}</p>
            <button onClick={() => handlePurchase('barracks')}>Purchase</button>
          </div>
        ) : (
          <p>Max Level Reached</p>
        )}
      </div>
      <div>
        <h3>Wall Fortification Upgrade</h3>
        {currentWallUpgrade ? (
          <div>
            <p>Level: {currentWallUpgrade.level}</p>
            <p>Cost: {currentWallUpgrade.cost} Gold</p>
            <p>Defensive Bonus: {currentWallUpgrade.bonus}</p>
            <button onClick={() => handlePurchase('wallFortifications')}>Purchase</button>
          </div>
        ) : (
          <p>Max Level Reached</p>
        )}
      </div>
      <div>
        <h3>Gold Production Upgrade</h3>
        {currentGoldProductionUpgrade ? (
          <div>
            <p>Level: {currentGoldProductionUpgrade.level}</p>
            <p>Cost: {currentGoldProductionUpgrade.cost} Gold</p>
            <p>Gold Production Bonus: {currentGoldProductionUpgrade.bonus} Gold per interval</p>
            <button onClick={() => handlePurchase('goldProduction')}>Purchase</button>
          </div>
        ) : (
          <p>Max Level Reached</p>
        )}
      </div>
      <div>
        <h3>Vault Upgrade</h3>
        {currentVaultUpgrade ? (
          <div>
            <p>Level: {currentVaultUpgrade.level}</p>
            <p>Cost: {currentVaultUpgrade.cost} Gold</p>
            <p>Capacity: {currentVaultUpgrade.capacity} Gold</p>
            <button onClick={() => handlePurchase('vault')}>Purchase</button>
          </div>
        ) : (
          <p>Max Level Reached</p>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Upgrades;
