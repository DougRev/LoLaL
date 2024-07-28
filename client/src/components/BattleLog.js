import React from 'react';

const BattleLog = ({ logs }) => {
  return (
    <div>
      <h3>Battle Log</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default BattleLog;
