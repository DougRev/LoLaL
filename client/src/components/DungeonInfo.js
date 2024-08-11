import React from 'react';
import HealthBar from './HealthBar';
import './DungeonInfo.css';

const DungeonInfo = ({
  dungeonName,
  bossName,
  bossImageUrl,
  bossHealth,
  maxBossHealth,
  playerName,
  playerHealth,
  maxPlayerHealth,
  healthBarsInitialized,
  battleStarted,
}) => {


  return (
    <div className="dungeon-info">
      <h2>{dungeonName}</h2>

      {battleStarted && (
        <>
          <h3>{bossName}</h3>
          <div className="boss-info">
            {healthBarsInitialized && (
              <HealthBar currentHealth={bossHealth} maxHealth={maxBossHealth} label="Boss Health" />
            )}
            <img src={bossImageUrl} alt={bossName} className="boss-image" />
          </div>
        </>
      )}

      <h3>Player: {playerName}</h3>
      {healthBarsInitialized && (
        <HealthBar currentHealth={playerHealth} maxHealth={maxPlayerHealth} label="Player Health" />
      )}
    </div>
  );
};

export default DungeonInfo;
