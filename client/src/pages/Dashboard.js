import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Units from '../components/Units';
import MyArmy from '../components/MyArmy';
import axios from 'axios';
import Upgrades from '../components/Upgrades';
import Vault from '../components/Vault';
import PlayerStats from '../components/PlayerStats';
import KingdomOverview from '../components/KingdomOverview';

import './Dashboard.css';

const Dashboard = () => {
  const { user, loading: userLoading, logout } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [kingdom, setKingdom] = useState(null);
  const [loadingKingdom, setLoadingKingdom] = useState(true);
  const [nextGoldUpdate, setNextGoldUpdate] = useState(0);
  const [nextActionPointUpdate, setNextActionPointUpdate] = useState(0);
  const [activeTab, setActiveTab] = useState('upgrades');

  const handleUnitPurchase = () => {
    setTriggerFetch(!triggerFetch);
  };

  const handleUnitAssign = () => {
    setTriggerFetch(!triggerFetch);
  };

  const { fetchKingdom } = useContext(AuthContext);

  const handleKingdomUpdate = () => {
    setTriggerFetch(!triggerFetch);
    // Also update the global kingdom state in AuthContext
    if (user?.kingdom?._id) {
      fetchKingdom(user.kingdom._id);
    }
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
      console.log('User data in Dashboard:', user); 
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
    return <div className='loading'>Loading...</div>;
  }

  if (!kingdom) {
    return <div>No kingdom data available. Please contact support.</div>;
  }

  console.log('Kingdom data passed to KingdomOverview:', kingdom);

  return (
    <div className="dashboard">
      <div className="main-content">
      <div className="overview-container">
      {console.log('Rendering KingdomOverview with:', kingdom)} {/* <-- Add this line */}
          <KingdomOverview  user={user} kingdom={kingdom} nextGoldUpdate={nextGoldUpdate} nextActionPointUpdate={nextActionPointUpdate} />
          <PlayerStats user={user} />
        </div>
        <div className="tabs">
          <button className={activeTab === 'recruiting' ? 'active' : ''} onClick={() => setActiveTab('recruiting')}>Recruiting</button>
          <button className={activeTab === 'barracks' ? 'active' : ''} onClick={() => setActiveTab('barracks')}>Barracks</button>
          <button className={activeTab === 'upgrades' ? 'active' : ''} onClick={() => setActiveTab('upgrades')}>Upgrades</button>
          <button className={activeTab === 'vault' ? 'active' : ''} onClick={() => setActiveTab('vault')}>Vault</button>
        </div>

        <div className="content">
          {activeTab === 'upgrades' && <Upgrades onUpgradePurchase={handleKingdomUpdate} />}
          {activeTab === 'recruiting' && <Units units={units} onUnitPurchase={handleUnitPurchase} onKingdomUpdate={handleKingdomUpdate} />}
          {activeTab === 'barracks' && <MyArmy triggerFetch={triggerFetch} onUnitAssign={handleUnitAssign} onKingdomUpdate={handleKingdomUpdate} />}
          {activeTab === 'vault' && <Vault triggerFetch={triggerFetch} onUnitAssign={handleUnitAssign} onKingdomUpdate={handleKingdomUpdate} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
