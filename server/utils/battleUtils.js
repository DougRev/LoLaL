// server/utils/battleUtils.js

const MIN_DAMAGE = 1;

// Helper function to calculate battle outcome
const calculateBattleOutcome = (attackerUnits, defenderUnits, attackerStats, defenderStats) => {
  let battleLog = [];
  let turnOrder = [];
  let accumulatedDamage = {}; // Track accumulated damage for each unit
  let killedUnits = { attacker: [], defender: [] };

  // Add attacker and defender stats to the turn order
  turnOrder.push({
    type: 'attacker',
    attack: attackerStats.attack,
    defense: attackerStats.defense,
    speed: attackerStats.speed,
    health: attackerStats.health,
  });

  turnOrder.push({
    type: 'defender',
    attack: defenderStats.attack,
    defense: defenderStats.defense,
    speed: defenderStats.speed,
    health: defenderStats.health,
  });

  // Add units to the turn order
  attackerUnits.forEach(unit => {
    for (let i = 0; i < unit.quantity; i++) {
      turnOrder.push({
        side: 'attacker',
        id: unit.unitId,
        name: unit.name,
        attack: unit.attack,
        defense: unit.defense,
        speed: unit.speed,
        health: unit.health,
      });
      accumulatedDamage[unit.unitId] = 0; // Initialize accumulated damage for each unit
    }
  });

  defenderUnits.forEach(unit => {
    for (let i = 0; i < unit.quantity; i++) {
      turnOrder.push({
        side: 'defender',
        id: unit.unitId,
        name: unit.name,
        attack: unit.attack,
        defense: unit.defense,
        speed: unit.speed,
        health: unit.health,
      });
      accumulatedDamage[unit.unitId] = 0; // Initialize accumulated damage for each unit
    }
  });

  // Sort by speed in descending order
  turnOrder.sort((a, b) => b.speed - a.speed);

  let attackerHealth = attackerStats.health + attackerUnits.reduce((acc, unit) => acc + (unit.health * unit.quantity), 0);
  let defenderHealth = defenderStats.health + defenderUnits.reduce((acc, unit) => acc + (unit.health * unit.quantity), 0);

  let turn = 1;
  let battleEnded = false;

  while (attackerHealth > 0 && defenderHealth > 0 && !battleEnded) {
    for (let i = 0; i < turnOrder.length; i++) {
      const entity = turnOrder[i];
      if (entity.health > 0 && !battleEnded) {
        // Determine the target (attacker vs. defender)
        const targetSide = entity.side === 'attacker' ? 'defender' : 'attacker';
        const targetEntities = turnOrder.filter(e => e.side === targetSide && e.health > 0);

        if (targetEntities.length === 0) {
          // If no targets remain, the battle ends
          battleEnded = true;
          break;
        }

        const targetEntity = targetEntities[Math.floor(Math.random() * targetEntities.length)]; // Random target selection

        // Calculate damage
        const damageReduction = Math.sqrt(targetEntity.defense) / (Math.sqrt(targetEntity.defense) + 10);
        let damage = Math.round(entity.attack * (1 - damageReduction));
        if (damage < MIN_DAMAGE) damage = MIN_DAMAGE;

        targetEntity.health -= damage;

        if (targetEntity.health <= 0) {
          battleLog.push(`Turn ${turn}: ${entity.name} defeats ${targetEntity.name}!`);
          targetEntity.health = 0;

          if (targetEntity.side === 'attacker') {
            killedUnits.attacker.push(targetEntity);
            attackerHealth -= damage;
          } else {
            killedUnits.defender.push(targetEntity);
            defenderHealth -= damage;
          }

          if (targetEntity.type !== 'user' && targetEntity.health === 0) {
            turnOrder.splice(i, 1); // Remove defeated unit from turn order
          }

          if (attackerHealth <= 0 || defenderHealth <= 0) {
            battleEnded = true;
            break;
          }
        } else {
          battleLog.push(`Turn ${turn}: ${entity.name} attacks ${targetEntity.name} for ${damage} damage.`);
        }
      }
    }

    turn++;
  }

  // Determine the outcome
  let outcome = 'draw';
  if (attackerHealth > 0 && defenderHealth <= 0) {
    outcome = 'attackerWins';
  } else if (defenderHealth > 0 && attackerHealth <= 0) {
    outcome = 'defenderWins';
  }

  return { outcome, battleLog, killedUnits };
};

// Process casualties (removing defeated units from the army)
const processPvPCasualties = async (kingdom, killedUnits) => {
  const unitsLost = {};

  killedUnits.forEach(killedUnit => {
    const unitIndex = kingdom.army.findIndex(armyUnit => armyUnit.unit.toString() === killedUnit.id);

    if (unitIndex > -1) {
      const unitName = kingdom.army[unitIndex].unit.name;
      if (!unitsLost[unitName]) {
        unitsLost[unitName] = 0;
      }
      unitsLost[unitName]++;

      kingdom.army[unitIndex].quantity--;
      if (kingdom.army[unitIndex].quantity <= 0) {
        kingdom.army.splice(unitIndex, 1); // Remove the unit from the army if quantity is 0 or less
      }
    }
  });

  await kingdom.save();
  return unitsLost;
};

module.exports = {
  calculateBattleOutcome,
  processPvPCasualties,
};
