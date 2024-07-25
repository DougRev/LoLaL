import React from 'react';

const KingdomInfo = ({ gold, offensiveStats, defensiveStats }) => {
  return (
    <div>
      <h2>Kingdom Information</h2>
      <p>Gold: {gold}</p>
      <p>Offensive Stats: {offensiveStats}</p>
      <p>Defensive Stats: {defensiveStats}</p>
    </div>
  );
};

export default KingdomInfo;
