import React, { useEffect } from 'react';
import './PlayerStats.css';
import commonRuneIcon from '../icons/common-rune.png';
import uncommonRuneIcon from '../icons/uncommon-rune.png';
import rareRuneIcon from '../icons/rare-rune.png';
import epicRuneIcon from '../icons/epic-rune.png';
import legendaryRuneIcon from '../icons/legendary-rune.png';

const PlayerStats = ({ user }) => {
  useEffect(() => {
    if (user && user.stats) {
      console.log('USER STATS:', user.stats);
    } else {
      console.log('Stats not available yet');
    }
  }, [user]);

  if (!user || !user.stats || !user.runeCollection) {
    return <div>Loading player stats...</div>; // Loading state
  }

  // Calculate total stats dynamically based on base stats and runes
  const calculateTotalStats = () => {
    return {
      attack: user.stats.base.attack + user.stats.runes.attack,
      defense: user.stats.base.defense + user.stats.runes.defense,
      speed: user.stats.base.speed + user.stats.runes.speed,
      health: user.stats.base.health + user.stats.runes.health
    };
  };

  const total = calculateTotalStats();
  const runeCollection = user.runeCollection;

  return (
    <div className="player-stats-container">
      <div className="player-stats">
        <h2>Player Stats</h2>
        <div className="stats-grid">
          <>
            <p><strong>Attack:</strong> {total.attack}</p>
            <p><strong>Defense:</strong> {total.defense}</p>
            <p><strong>Speed:</strong> {total.speed}</p>
            <p><strong>Health:</strong> {total.health}</p>
          </>
        </div>
      </div>

      <div className="rune-stats">
        <h2>Rune Collection</h2>
        <div className="rune-items">
          <div className="rune-item">
            <img src={commonRuneIcon} alt="Common Rune" className="rune-icon" />
            <p>{runeCollection.common || 0}</p>
          </div>
          <div className="rune-item">
            <img src={uncommonRuneIcon} alt="Uncommon Rune" className="rune-icon" />
            <p>{runeCollection.uncommon || 0}</p>
          </div>
          <div className="rune-item">
            <img src={rareRuneIcon} alt="Rare Rune" className="rune-icon" />
            <p>{runeCollection.rare || 0}</p>
          </div>
          <div className="rune-item">
            <img src={epicRuneIcon} alt="Epic Rune" className="rune-icon" />
            <p>{runeCollection.epic || 0}</p>
          </div>
          <div className="rune-item">
            <img src={legendaryRuneIcon} alt="Legendary Rune" className="rune-icon" />
            <p>{runeCollection.legendary || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
