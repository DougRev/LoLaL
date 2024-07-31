import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './DungeonSelection.css';

const DungeonSelection = ({ selectedDungeon, onBack }) => {
  const { user } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [battleResult, setBattleResult] = useState(null);
  const [error, setError] = useState(null);
  const [battleLogMessages, setBattleLogMessages] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get(`/api/users/${user._id}/army`);
        const offensiveUnits = response.data.army.filter(unit => unit.assignedTo === 'offensive');
        setUnits(offensiveUnits);
        console.log('Fetched offensive units:', offensiveUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
        setError('Error fetching units');
      }
    };

    fetchUnits();
  }, [user._id]);

  const handleUnitChange = (unitId, quantity) => {
    if (quantity < 0) quantity = 0;
    const maxQuantity = units.find(unit => unit.unit._id === unitId)?.quantity || 0;
    if (quantity > maxQuantity) quantity = maxQuantity;

    setSelectedUnits({
      ...selectedUnits,
      [unitId]: quantity,
    });
    console.log('Selected units updated:', selectedUnits);
  };

  const handleBattle = async () => {
    // Check if the selected dungeon can be attempted
    if (selectedDungeon.level > user.highestDungeonCompleted + 1) {
      setError('You must complete the previous dungeons before attempting this one.');
      return;
    }
  
    setError(null);
    setBattleResult(null);
    setBattleLogMessages([]);
    setCurrentLogIndex(0);
  
    try {
        const response = await axios.post('/api/dungeons/battle', {
          userId: user._id,
          dungeonId: selectedDungeon._id,
          units: selectedUnits,
        });
        
        setBattleResult(response.data);
        setBattleLogMessages(response.data.battleLog);
      } catch (error) {
        console.error('Error starting battle:', error);
        setError('Error starting battle');
      }
    };
  

  useEffect(() => {
    if (battleLogMessages.length > 0 && currentLogIndex < battleLogMessages.length) {
      const timer = setTimeout(() => {
        setCurrentLogIndex(prevIndex => prevIndex + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [battleLogMessages, currentLogIndex]);

  return (
    <div className="dungeon-details">
      <h3>Dungeon: {selectedDungeon.name}</h3>
      <p>Boss: {selectedDungeon.boss.name}</p>
      <p>Attack: {selectedDungeon.boss.attack}</p>
      <p>Defense: {selectedDungeon.boss.defense}</p>
      <p>Health: {selectedDungeon.boss.health}</p>
      <p>Speed: {selectedDungeon.boss.speed}</p>

      <div className="unit-selection">
        <h3>Select Units to Send</h3>
        {units.length > 0 ? (
          units.map(unit => (
            <div key={unit.unit._id}>
              <label>{unit.unit.name} (Available: {unit.quantity})</label>
              <input
                type="number"
                value={selectedUnits[unit.unit._id] || 0}
                onChange={(e) => handleUnitChange(unit.unit._id, parseInt(e.target.value))}
                min="0"
                max={unit.quantity}
              />
            </div>
          ))
        ) : (
          <p>No offensive units available.</p>
        )}
        <button onClick={handleBattle} disabled={!selectedDungeon}>Start Battle</button>
        <button className="back-button" onClick={onBack}>Back</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="battle-log">
        <h4>Battle Log:</h4>
        <ul>
          {battleLogMessages.slice(0, currentLogIndex).map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>

      {battleResult && currentLogIndex >= battleLogMessages.length && (
        <div>
            <h3>Battle Result</h3>
            <p>{battleResult.message}</p>
            <p>Gold Earned: {battleResult.goldEarned}</p>
            <div>
            <h4>Units Lost:</h4>
            <ul>
                {Object.entries(battleResult.unitsLost).map(([unitId, quantity]) => (
                <li key={unitId}>
                    {units.find(unit => unit.unit._id === unitId)?.unit.name}: {quantity}
                </li>
                ))}
            </ul>
            </div>
            {battleResult.rune && (
            <div>
                <h4>Rune Dropped!</h4>
                <p>Tier: {battleResult.rune.tier}</p>
                <p>Buffs: Attack +{battleResult.rune.buffs.attack}, Defense +{battleResult.rune.buffs.defense}, Speed +{battleResult.rune.buffs.speed}, Health +{battleResult.rune.buffs.health}</p>
            </div>
            )}
            <button id='ds-button' onClick={onBack}>Return to Dungeons</button>
        </div>
        )}
    </div>
  );
};

export default DungeonSelection;
