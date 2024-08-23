import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './KingdomList.css';

const KingdomList = () => {
  const [kingdoms, setKingdoms] = useState([]);

  useEffect(() => {
    const fetchKingdoms = async () => {
      try {
        const response = await axios.get('/api/kingdoms'); // Assume you have an API endpoint for this
        setKingdoms(response.data);
      } catch (error) {
        console.error('Error fetching kingdoms:', error);
      }
    };

    fetchKingdoms();
  }, []);

  const factionColors = {
    'Warrior Brotherhood': '#FFD700', // Example color
    'Arcane Alliance': '#87CEEB', // Example color
    'Defensive Coalition': '#FF6347', // Example color
    'Trade Consortium': '#FF6347',
    // Add more factions as needed
  };

  return (
    <div className="kingdom-list">
      <h2>Available Kingdoms to Attack</h2>
      <table>
        <thead>
          <tr>
            <th>Kingdom Name</th>
            <th>Faction</th>
            <th>Gold</th>
            <th>Attack</th>
            <th>Defense</th>
          </tr>
        </thead>
        <tbody>
          {kingdoms.map((kingdom) => (
            <tr
              key={kingdom._id}
              style={{
                backgroundColor: factionColors[kingdom.faction.name] || '#f5f5f5', // Default color if faction is not matched
              }}
            >
              <td>{kingdom.name}</td>
              <td>{kingdom.faction.name}</td>
              <td>{kingdom.gold}</td>
              <td>{kingdom.offensiveStats}</td>
              <td>{kingdom.defensiveStats}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KingdomList;
