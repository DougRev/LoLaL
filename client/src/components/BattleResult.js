import React from 'react';

const BattleResult = ({ result, onBack }) => {
  // Check if there are any units lost
  const hasUnitsLost = Object.keys(result.unitsLost).length > 0;

  return (
    <div>
      <h2>Battle Result</h2>
      <p>{result.message}</p>
      <p>Gold Earned: {result.goldEarned}</p>

      {hasUnitsLost && (
        <div>
          <h4>Units Lost:</h4>
          <ul>
            {Object.entries(result.unitsLost).map(([unitId, quantity]) => (
              <li key={unitId}>
                {/* Find the unit by ID and display its name, fallback to "Unknown Unit" */}
                {result.units.find(unit => unit.unit._id === unitId)?.unit.name || "Unknown Unit"}: {quantity}
              </li>
            ))}
          </ul>
        </div>
      )}

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
