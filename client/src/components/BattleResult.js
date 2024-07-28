import React from 'react';

const BattleResult = ({ result }) => {
  return (
    <div>
      <h2>Battle Result</h2>
      <p>{result.message}</p>
      <p>Units Lost: {result.unitsLost}</p>
      <p>Gold Earned: {result.goldEarned}</p>
      <button onClick={() => window.location.reload()}>Back to Dungeons</button>
    </div>
  );
};

export default BattleResult;
