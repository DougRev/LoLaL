import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Units from '../components/Units';
import MyArmy from '../components/MyArmy';
import axios from 'axios';
import './Dashboard.css';
import Upgrades from '../components/Upgrades';

const Dashboard = () => {
  const { user, loading: userLoading, logout } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [kingdom, setKingdom] = useState(null);
  const [loadingKingdom, setLoadingKingdom] = useState(true);
  const [nextGoldUpdate, setNextGoldUpdate] = useState(0);
  const [nextActionPointUpdate, setNextActionPointUpdate] = useState(0);

  const handleUnitPurchase = () => {
    setTriggerFetch(!triggerFetch);
  };

  const handleUnitAssign = () => {
    setTriggerFetch(!triggerFetch);
  };

  const handleKingdomUpdate = () => {
    setTriggerFetch(!triggerFetch);
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/units');
        setUnits(response.data);
        console.log('Fetched units:', response.data);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    fetchUnits();
  }, []);

  useEffect(() => {
    const fetchKingdom = async () => {
      if (user && user.kingdom) {
        console.log('User kingdom ID:', user.kingdom);
        try {
          const response = await axios.get(`/api/kingdoms/${user.kingdom._id}`);
          setKingdom(response.data);
          console.log('Fetched kingdom:', response.data);

          const interval = 60000; // 1 minute interval for gold
          const actionInterval = 300000; // 5 minute interval for action points
          const now = Date.now();
          const lastGoldCollection = new Date(response.data.lastGoldCollection).getTime();
          const lastActionPointUpdate = new Date(response.data.lastActionPointUpdate).getTime();
          setNextGoldUpdate(interval - (now - lastGoldCollection) % interval);
          setNextActionPointUpdate(actionInterval - (now - lastActionPointUpdate) % actionInterval);
        } catch (error) {
          console.error('Error fetching kingdom:', error);
        } finally {
          setLoadingKingdom(false);
        }
      } else {
        console.error('No kingdom ID found in user object');
        setLoadingKingdom(false);
      }
    };

    if (!userLoading) {
      fetchKingdom();
    }
  }, [user, triggerFetch, userLoading]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNextGoldUpdate((prev) => {
        if (prev > 1000) {
          return prev - 1000;
        } else {
          handleKingdomUpdate();
          return 60000; // Reset interval
        }
      });
      setNextActionPointUpdate((prev) => {
        if (prev > 1000) {
          return prev - 1000;
        } else {
          handleKingdomUpdate();
          return 300000; // Reset interval
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (userLoading || loadingKingdom) {
    return <div>Loading...</div>;
  }

  if (!kingdom) {
    return <div>No kingdom data available. Please contact support.</div>;
  }

  return (
    <div>
      <h1>Kingdom Dashboard</h1>
      {user && <p>Welcome to your dashboard, {user.name}!</p>}

      <div id='kingdom-stats'>
        <p><strong>Faction: </strong> {user && user.faction}</p>
        <p><strong>Gold: </strong>{kingdom.gold}</p>
        <p><strong>Offense: </strong> {kingdom.offensiveStats}</p>
        <p><strong>Defense: </strong>{kingdom.defensiveStats}</p>
        <p><strong>Action Points: </strong>{kingdom.actionPoints}</p>

      </div>

      <div id='action-stats'>
        <p><strong>Gold Production Rate: </strong>{kingdom.goldProductionRate} per minute</p>
        <p><strong>Next Gold Update: </strong>{Math.floor(nextGoldUpdate / 1000)} seconds</p>
        <p><strong>Next Action Point Update: </strong>{Math.floor(nextActionPointUpdate / 1000)} seconds</p>
      </div>
      <MyArmy triggerFetch={triggerFetch} onUnitAssign={handleUnitAssign} onKingdomUpdate={handleKingdomUpdate}/>
      <Units units={units} onUnitPurchase={handleUnitPurchase} onKingdomUpdate={handleKingdomUpdate}/>
      <Upgrades onUpgradePurchase={handleKingdomUpdate} />
    </div>
  );
};

export default Dashboard;
