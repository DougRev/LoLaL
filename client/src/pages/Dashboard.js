import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Units from '../components/Units';
import KingdomInfo from '../components/KingdomInfo';
import MyArmy from '../components/MyArmy';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [kingdom, setKingdom] = useState(null);

  const handleUnitPurchase = () => {
    setTriggerFetch(!triggerFetch);
  };

  const handleUnitAssign = () => {
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
          const response = await axios.get(`http://localhost:3000/api/kingdoms/${user.kingdom._id}`);
          setKingdom(response.data);
          console.log('Fetched kingdom:', response.data);
        } catch (error) {
          console.error('Error fetching kingdom:', error);
        }
      } else {
        console.error('No kingdom ID found in user object');
      }
    };

    fetchKingdom();
  }, [user, triggerFetch]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (!kingdom) {
    return <div>No kingdom data available. Please contact support.</div>;
  }

  return (
    <div>
      <h1>Kingdom Dashboard</h1>
      <p>Welcome to your dashboard, {user.name}!</p>
      <p>Your faction: {user.faction}</p>
      <div id='main-stats'>
        <p><strong>Gold: </strong>{kingdom.gold}</p>
        <p><strong>Offense: </strong> {kingdom.offensiveStats}</p>
        <p><strong>Defense: </strong>{kingdom.defensiveStats}</p>
      </div>
      <MyArmy triggerFetch={triggerFetch} />
      <Units units={units} onUnitPurchase={handleUnitPurchase} onUnitAssign={handleUnitAssign} />
    </div>
  );
};

export default Dashboard;
