import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const upgrades = {
  barracks: [
    { level: 1, name: 'Barracks Level 1', cost: 100, bonus: 10 },
    { level: 2, name: 'Barracks Level 2', cost: 200, bonus: 20 },
    { level: 3, name: 'Barracks Level 3', cost: 300, bonus: 30 }
  ],
  wallFortifications: [
    { level: 1, name: 'Wooden Palisade', cost: 100, bonus: 10 },
    { level: 2, name: 'Stone Wall', cost: 500, bonus: 50 },
    { level: 3, name: 'Fortress Wall', cost: 1000, bonus: 100 }
  ]
};

const Upgrades = ({ onUpgradePurchase }) => {
  const { user } = useContext(AuthContext);
  const [kingdom, setKingdom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKingdom = async () => {
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
  }, [user.kingdom]);

  const handlePurchase = async (upgradeType) => {
    try {
      const response = await axios.post('/api/upgrades/purchase-upgrade', { userId: user._id, upgradeType });
      setKingdom(response.data);
      console.log('Upgrade purchased:', response.data);
      onUpgradePurchase(); // Trigger parent component to update
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      setError(error.message);
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
    </div>
  );
};

export default Upgrades;
