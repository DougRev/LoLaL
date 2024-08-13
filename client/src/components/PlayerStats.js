import React from 'react';
import './PlayerStats.css';

const PlayerStats = ({ user }) => {
  if (!user || !user.stats) {
    return null;
  }

  const { total } = user.stats;

  return (
    <div className="player-stats">
      <h2>Player Stats</h2>
      <div className="stats">
        <p><strong>Attack:</strong> {total.attack}</p>
        <p><strong>Defense:</strong> {total.defense}</p>
        <p><strong>Speed:</strong> {total.speed}</p>
        <p><strong>Health:</strong> {total.health}</p>
      </div>
    </div>
  );
};

export default PlayerStats;
