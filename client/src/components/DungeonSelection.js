import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const DungeonSelection = ({ dungeons, selectedDungeon }) => {
  const { user } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [battleResult, setBattleResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get(`/api/users/${user._id}/army`);
        const offensiveUnits = response.data.army.filter(unit => unit.assignedTo === 'offensive');
        setUnits(offensiveUnits);
        console.log('Fetched offensive units:', offensiveUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
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
    setError(null);
    setBattleResult(null);

    try {
      const response = await axios.post('/api/dungeons/battle', {
        userId: user._id,
        dungeonId: selectedDungeon._id,
        units: selectedUnits,
      });
      setBattleResult(response.data);
      console.log('Battle result:', response.data);
    } catch (error) {
      console.error('Error starting battle:', error);
      setError('Error starting battle');
    }
  };

  return (
    <div>
      <h2>Dungeon Selection</h2>
      <div>
        <h3>{selectedDungeon.name}</h3>
        <p>Boss: {selectedDungeon.boss.name}</p>
        <p>Attack: {selectedDungeon.boss.attack}</p>
        <p>Defense: {selectedDungeon.boss.defense}</p>
      </div>
      <div>
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
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {battleResult && (
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
        </div>
      )}
    </div>
  );
};

export default DungeonSelection;
