import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DungeonInfo from '../components/DungeonInfo';
import UnitSelection from '../components/UnitSelection';
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
  const [loading, setLoading] = useState(false);
  const [battleStarted, setBattleStarted] = useState(false);
  const [fading, setFading] = useState(false);
  const battleLogRef = useRef(null);

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/users/${user._id}/army`);
        const offensiveUnits = response.data.army.filter(unit => unit.assignedTo === 'offensive');
        setUnits(offensiveUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
        setError('Error fetching units');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [user._id]);

  const handleUnitChange = (unitId, quantity) => {
    const maxQuantity = units.find(unit => unit.unit._id === unitId)?.quantity || 0;
    quantity = Math.max(0, Math.min(quantity, maxQuantity));

    setSelectedUnits(prev => ({
      ...prev,
      [unitId]: quantity,
    }));
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
    // Find the progress for the current region
    let userRegionProgress = user.regionProgress.find(entry => entry.regionId === selectedDungeon.region.toString());
  
    // If userRegionProgress is undefined, initialize it (this could happen if the region is newly unlocked)
    if (!userRegionProgress) {
      userRegionProgress = {
        regionId: selectedDungeon.region.toString(),
        completedDungeons: [],
        isRegionCompleted: false,
      };
      // Optionally, push this new region progress to the user's regionProgress array in the backend.
    }
  
    // Check if the user is eligible to attempt the dungeon
    const isEligible = userRegionProgress.completedDungeons.some(d => d.dungeonId === selectedDungeon._id.toString());
  
    // If not eligible, ensure that the dungeon is the next one in sequence
    if (!isEligible && selectedDungeon.level !== userRegionProgress.completedDungeons.length + 1) {
      setError('You must complete the previous dungeons before attempting this one.');
      return;
    }
  
    // Proceed with the battle
    setError(null);
    setBattleResult(null);
    setBattleLogMessages([]);
    setCurrentLogIndex(0);
    setBossHealth(selectedDungeon?.boss?.health || 0);
  
    setFading(true);
    setTimeout(async () => {
      setBattleStarted(true);
      const initialPlayerHealth = calculatePlayerHealth();
      setPlayerHealth(initialPlayerHealth);
      setMaxPlayerHealth(initialPlayerHealth);
      setHealthBarsInitialized(true);
  
      setLoading(true);
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
      } finally {
        setLoading(false);
        setFading(false);
      }
    }, 500);
  };
  
  

  useEffect(() => {
    if (battleLogMessages.length > 0 && currentLogIndex < battleLogMessages.length) {
      const delay = healthBarsInitialized && currentLogIndex === 0 ? 3000 : 2000;
      const timer = setTimeout(() => {
        const currentLog = battleLogMessages[currentLogIndex];
        let damage = 0;

        if (currentLog.includes('Boss attacks for')) {
          const damageMatch = currentLog.match(/Boss attacks for (\d+)!/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1], 10);
            setPlayerHealth(prev => Math.max(0, prev - damage));
          }
        } else if (currentLog.includes('Player dealt')) {
          const damageMatch = currentLog.match(/Player dealt (\d+) damage to the boss/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1], 10);
            setBossHealth(prev => Math.max(0, prev - damage));
          }
        } else if (currentLog.includes("Player's units dealt a total of")) {
          const damageMatch = currentLog.match(/Player's units dealt a total of (\d+) damage to the boss/);
          if (damageMatch) {
            damage = parseInt(damageMatch[1], 10);
            setBossHealth(prev => Math.max(0, prev - damage));
          }
        }

        if (currentLog.includes('defeats the boss')) {
          setBossHealth(0);
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

  const bossName = selectedDungeon?.boss?.name || "Unknown Boss";
  const bossImageUrl = selectedDungeon?.boss?.image || "";
  const dungeonName = selectedDungeon?.name || "Unknown Dungeon";
  const actionPointCost = selectedDungeon?.actionPointCost || 0;

  const dungeonDetailsStyle = battleStarted ? { backgroundImage: `url(${selectedDungeon.image})` } : {};

  return (
    <div className={`dungeon-details ${fading ? 'fade' : ''}`} style={dungeonDetailsStyle}>
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <DungeonInfo
            dungeonName={dungeonName}
            bossName={bossName}
            bossImageUrl={bossImageUrl}
            bossHealth={bossHealth}
            maxBossHealth={selectedDungeon?.boss?.health}
            playerName={user?.name}
            playerHealth={playerHealth}
            maxPlayerHealth={maxPlayerHealth}
            healthBarsInitialized={healthBarsInitialized}
            battleStarted={battleStarted}
          />

          {!battleStarted && (
            <div className="dungeon-pre-battle-info">
              <h4>AP Cost: {actionPointCost}</h4>
              <UnitSelection
                units={units}
                selectedUnits={selectedUnits}
                onUnitChange={handleUnitChange}
                onBattleStart={handleBattle}
                onBack={onBack}
              />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {battleStarted && (
            <>
              <h4>Battle Log:</h4>
              <div className="battle-log" ref={battleLogRef}>
                <ul>
                  {battleLogMessages.slice(0, currentLogIndex).map((log, index) => (
                    <li key={index} className={index === currentLogIndex - 1 ? 'recent-log' : ''}>{log}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {battleResult && currentLogIndex >= battleLogMessages.length && (
            <div className="battle-result-popup">
              <h3>Battle Result</h3>
              <p>{battleResult.message}</p>
              <p>Gold Earned: {battleResult.goldEarned}</p>
              {Object.keys(battleResult.unitsLost).length > 0 && (
                <div>
                  <h4>Units Lost:</h4>
                  <ul>
                    {Object.entries(battleResult.unitsLost).map(([unitId, quantity]) => {
                      // Since unitId might be passing the unit name, let's adjust the logic here
                      const unit = units.find(unit => unit.unit._id.toString() === unitId || unit.unit.name === unitId);
                      const unitName = unit ? unit.unit.name : "Unknown Unit";

                      return (
                        <li key={unitId}>
                          {unitName}: {quantity}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
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
        </>
      )}
    </div>
  );
};

export default DungeonSelection;
