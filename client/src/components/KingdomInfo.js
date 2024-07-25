import React from 'react';

const KingdomInfo = ({ gold, offensiveStats }) => {
  return (
    <div>
      <h2>Kingdom Information</h2>
      <p>Gold: {gold}</p>
      <p>Offensive Stats: {offensiveStats}</p>
    </div>
  );
};

export default KingdomInfo;
