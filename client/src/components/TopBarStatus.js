import React, { useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faFistRaised, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import attackIcon from '../icons/sword.png';
import { AuthContext } from '../context/AuthContext';
import './TopBarStatus.css';

const TopBarStatus = () => {
  const { kingdom, triggerFetchKingdom } = useContext(AuthContext);

  useEffect(() => {
    triggerFetchKingdom(); // Initial fetch

    // No need for interval-based fetching; rely on event-driven updates
    return () => {}; // No cleanup needed, just a placeholder
  }, [triggerFetchKingdom]);

  return (
    <div className="top-bar-status">
      <div className="status-item">
        <FontAwesomeIcon icon={faCoins} />
        <span>Gold: {kingdom?.gold}</span>
      </div>
      <div className="status-item">
        <FontAwesomeIcon icon={faFistRaised} />
        <span>Action Points: {kingdom?.actionPoints}</span>
      </div>
      <div className="status-item">
        <img src={attackIcon} alt="Attack Icon" className="icon" />
        <span>Attack: {kingdom?.offensiveStats}</span>
      </div>
      <div className="status-item">
        <FontAwesomeIcon icon={faShieldAlt} />
        <span>Defense: {kingdom?.defensiveStats}</span>
      </div>
    </div>
  );
};

export default TopBarStatus;
