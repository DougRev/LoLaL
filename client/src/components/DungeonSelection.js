import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import HealthBar from '../components/HealthBar';
import './DungeonSelection.css';

const DungeonSelection = ({ selectedDungeon, onBack }) => {
  const { user } = useContext(AuthContext);
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [battleResult, setBattleResult] = useState(null);
  const [error, setError] = useState(null);
  const [battleLogMessages, setBattleLogMessages] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [bossHealth, setBossHealth] = useState(selectedDungeon?.boss?.health || 0);
  const [playerHealth, setPlayerHealth] = useState(0);
  const [maxPlayerHealth, setMaxPlayerHealth] = useState(0);
  const [healthBarsInitialized, setHealthBarsInitialized] = useState(false);
  const battleLogRef = useRef(null);

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

    setSelectedUnits(prev => ({
      ...prev,
      [unitId]: quantity,
    }));
    console.log('Selected units updated:', selectedUnits);
  };

  const calculatePlayerHealth = () => {
    let totalHealth = user?.stats?.total?.health || 0;
    units.forEach(unit => {
      if (selectedUnits[unit.unit._id]) {
        totalHealth += unit.unit.health * selectedUnits[unit.unit._id];
      }
    });
    return totalHealth;
  };

  const handleBattle = async () => {
    if ((selectedDungeon?.level || 0) > (user?.highestDungeonCompleted || 0) + 1) {
      setError('You must complete the previous dungeons before attempting this one.');
      return;
    }

    setError(null);
    setBattleResult(null);
    setBattleLogMessages([]);
    setCurrentLogIndex(0);
    setBossHealth(selectedDungeon?.boss?.health || 0);

    const initialPlayerHealth = calculatePlayerHealth();
    setPlayerHealth(initialPlayerHealth);
    setMaxPlayerHealth(initialPlayerHealth);
    setHealthBarsInitialized(true); // Mark health bars as initialized

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
      const delay = healthBarsInitialized && currentLogIndex === 0 ? 3000 : 2000; // 3s delay for the first log entry
      const timer = setTimeout(() => {
        const currentLog = battleLogMessages[currentLogIndex];
        console.log('Current Log:', currentLog);
  
        let damage = 0;
  
        if (currentLog.includes('Boss attacks for')) {
          const damageMatch = currentLog.match(/Boss attacks for (\d+)!/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1], 10);
            console.log('Boss Damage:', damage);
            setPlayerHealth(prev => {
              const updatedHealth = Math.max(0, prev - damage);
              console.log('Updated Player Health:', updatedHealth);
              return updatedHealth;
            });
          }
        } else if (currentLog.includes('Player dealt')) {
          const damageMatch = currentLog.match(/Player dealt (\d+) damage to the boss/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1], 10);
            console.log('Player Damage:', damage);
            setBossHealth(prev => {
              const updatedHealth = Math.max(0, prev - damage);
              console.log('Updated Boss Health:', updatedHealth);
              return updatedHealth;
            });
          }
        } else if (currentLog.includes("Player's units dealt a total of")) {
          const damageMatch = currentLog.match(/Player's units dealt a total of (\d+) damage to the boss/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1], 10);
            console.log("Units Damage:", damage);
            setBossHealth(prev => {
              const updatedHealth = Math.max(0, prev - damage);
              console.log('Updated Boss Health (units attack):', updatedHealth);
              return updatedHealth;
            });
          }
        }
  
        // Check if the boss is defeated and set health to 0
        if (currentLog.includes('defeats the boss')) {
          setBossHealth(0);
          console.log('Boss Health set to 0 as the boss has been defeated.');
        }

        setCurrentLogIndex(prevIndex => prevIndex + 1);

        if (battleLogRef.current) {
          battleLogRef.current.scrollTo({
            top: battleLogRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [battleLogMessages, currentLogIndex, healthBarsInitialized]);
  
// Safeguard against undefined selectedDungeon or its properties
const bossName = selectedDungeon?.boss?.name || "Unknown Boss";
const bossImageUrl = selectedDungeon?.boss?.image || "";  // Assuming there's a boss image URL
const dungeonName = selectedDungeon?.name || "Unknown Dungeon";
console.log('Boss Health:', bossHealth);

return (
  <div className="dungeon-details">
    <h2>{dungeonName}</h2>
    <h3>{bossName}</h3>
    <img src={bossImageUrl} alt={bossName} className="boss-image" />

    {healthBarsInitialized && (
      <HealthBar currentHealth={bossHealth} maxHealth={selectedDungeon.boss.health} label="Boss Health" />
    )}

    <h3>Player: {user?.name}</h3>
    {healthBarsInitialized && (
      <HealthBar currentHealth={playerHealth} maxHealth={maxPlayerHealth} label="Player Health" />
    )}

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

    <div className="battle-log" ref={battleLogRef}>
      <h4>Battle Log:</h4>
      <ul>
        {battleLogMessages.slice(0, currentLogIndex).map((log, index) => (
          <li key={index} className={index === currentLogIndex - 1 ? 'recent-log' : ''}>{log}</li>
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
                {units.find(unit => unit.unit._id === unitId)?.unit.name || "Unknown Unit"}: {quantity}
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
