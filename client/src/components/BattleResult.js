import React from 'react';

const BattleResult = ({ result, onBack }) => {
  return (
    <div>
      <h2>Battle Result</h2>
      <p>{result.message}</p>
      <p>Gold Earned: {result.goldEarned}</p>
      <div>
        <h4>Units Lost:</h4>
        <ul>
          {Object.entries(result.unitsLost).map(([unitId, quantity]) => (
            <li key={unitId}>
              {result.units.find(unit => unit.unit._id === unitId)?.unit.name || "Unknown Unit"}: {quantity}
            </li>
          ))}
        </ul>
      </div>
      {result.rune && (
        <div>
          <h4>Rune Dropped!</h4>
          <p>Tier: {result.rune.tier}</p>
          <p>Buffs: Attack +{result.rune.buffs.attack}, Defense +{result.rune.buffs.defense}, Speed +{result.rune.buffs.speed}, Health +{result.rune.buffs.health}</p>
        </div>
      )}
      <button onClick={onBack}>Back to Dungeons</button>
    </div>
  );
};

export default BattleResult;
