import React from 'react';
import './KingdomOverview.css';

const KingdomOverview = ({ user, kingdom, nextGoldUpdate, nextActionPointUpdate }) => {
    if (!kingdom) {
      return <div>Loading kingdom data...</div>;
    }
    console.log('Faction in KingdomOverview:', kingdom.faction);

    return (
        <div className="kingdom-overview">
          <h2>Kingdom Overview</h2>
          <div className="kingdom-info-container">
            <div className='kingdom-info'>
              <p><strong>Kingdom Name:</strong> {kingdom.name}</p>
              <p><strong>Faction:</strong> {user.faction?.name || 'Unknown Faction'}</p>
              <p><strong>Level:</strong> {kingdom.level || 'N/A'}</p>
              <p><strong>Vault Capacity:</strong> {kingdom.vault?.capacity || 'N/A'}</p>
            </div>

            <div className='kingdom-production'>
              <p><strong>Gold Production Rate:</strong> {kingdom.goldProductionRate || 'N/A'} per minute</p>
              <p><strong>Next Gold Update:</strong> {Math.floor(nextGoldUpdate / 1000) || 'N/A'} seconds</p>
              <p><strong>Next Action Point Update:</strong> {Math.floor(nextActionPointUpdate / 1000) || 'N/A'} seconds</p>
            </div>
          </div>
      </div>
    );
};

export default KingdomOverview;
