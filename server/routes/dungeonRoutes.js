const express = require('express');
const router = express.Router();
const Dungeon = require('../models/Dungeon');
const User = require('../models/User');
const Unit = require('../models/Unit');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminMiddleware');

// Get all dungeons
router.get('/', async (req, res) => {
  try {
    const dungeons = await Dungeon.find();
    res.json(dungeons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new dungeon
router.post('/', [auth, admin], async (req, res) => {
  const { name, level, boss, reward } = req.body;

  try {
    const newDungeon = new Dungeon({
      name,
      level,
      boss,
      reward
    });

    await newDungeon.save();
    res.status(201).json(newDungeon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a dungeon
router.put('/:id', [auth, admin], async (req, res) => {
  const { id } = req.params;
  const { name, level, boss, reward } = req.body;

  try {
    const updatedDungeon = await Dungeon.findByIdAndUpdate(
      id,
      { name, level, boss, reward },
      { new: true }
    );
    res.json(updatedDungeon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a dungeon
router.delete('/:id', [auth, admin], async (req, res) => {
  const { id } = req.params;

  try {
    await Dungeon.findByIdAndDelete(id);
    res.json({ message: 'Dungeon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const calculateTurnBasedBattleOutcome = (units, dungeon) => {
    let playerAttack = 0;
    let playerDefense = 0;
    let battleLog = [];
  
    units.forEach(unit => {
      playerAttack += unit.attack * unit.quantity;
      playerDefense += unit.defense * unit.quantity;
    });
  
    const bossAttack = dungeon.boss.attack;
    const bossDefense = dungeon.boss.defense;
    const bossSpeed = dungeon.boss.speed || 1; // Speed advantage for boss
  
    let playerSpeed = 1; // Constant speed for player's units
    let playerHealth = playerDefense;
    let bossHealth = bossDefense;
  
    let turn = 1;
    while (playerHealth > 0 && bossHealth > 0) {
      if (turn % bossSpeed === 0) {
        // Boss attacks first
        playerHealth -= bossAttack;
        battleLog.push(`Turn ${turn}: Boss attacks! Player's health is now ${playerHealth}`);
        if (playerHealth <= 0) break; // If player is defeated, break the loop
      }
      if (turn % playerSpeed === 0 && playerHealth > 0) {
        // Player attacks
        bossHealth -= playerAttack;
        battleLog.push(`Turn ${turn}: Player attacks! Boss's health is now ${bossHealth}`);
        if (bossHealth <= 0) break; // If boss is defeated, break the loop
      }
      turn++;
    }
  
    let result = 'lose';
    if (bossHealth <= 0 && playerHealth > 0) {
      result = 'win';
    } else if (playerHealth <= 0 && bossHealth <= 0) {
      result = 'draw';
    }
  
    return { result, playerAttack, playerDefense, bossAttack, bossDefense, battleLog };
  };
  
  const calculateTurnBasedCasualties = (units, result) => {
    const casualties = {};
    units.forEach(unit => {
      let lossFactor = 0;
      if (result === 'win') {
        lossFactor = 0.1;
      } else if (result === 'draw') {
        lossFactor = 0.3;
      } else if (result === 'lose') {
        lossFactor = 0.5;
      }
      casualties[unit.unitId] = Math.floor(unit.quantity * lossFactor);
    });
  
    return casualties;
  };
  
  router.post('/battle', async (req, res) => {
    const { userId, dungeonId, units } = req.body;
  
    try {
      const user = await User.findById(userId).populate('kingdom');
      const dungeon = await Dungeon.findById(dungeonId);
  
      if (!user || !dungeon) {
        return res.status(404).json({ message: 'User or dungeon not found' });
      }
  
      const unitIds = Object.keys(units);
      const unitDetails = await Unit.find({ _id: { $in: unitIds } });
  
      const battleUnits = unitDetails.map(unitDetail => {
        const quantity = units[unitDetail._id.toString()];
        return {
          unitId: unitDetail._id.toString(),
          name: unitDetail.name,
          attack: unitDetail.attack,
          defense: unitDetail.defense,
          quantity: quantity,
        };
      });
  
      console.log('User and Dungeon fetched:', user, dungeon);
      console.log('Battle Units:', battleUnits);
  
      const { result, playerAttack, playerDefense, bossAttack, bossDefense, battleLog } = calculateTurnBasedBattleOutcome(battleUnits, dungeon);
      const casualties = calculateTurnBasedCasualties(battleUnits, result);
  
      console.log('Battle calculations:', { playerAttack, playerDefense, bossAttack, bossDefense, result });
      console.log('Calculated casualties:', casualties);
  
      battleUnits.forEach(unit => {
        const armyUnit = user.kingdom.army.find(armyUnit => armyUnit.unit.toString() === unit.unitId);
        if (armyUnit) {
          armyUnit.quantity -= casualties[unit.unitId];
        }
      });
  
      if (result === 'win') {
        user.kingdom.gold += dungeon.reward.gold;
      }
  
      await user.kingdom.save();
  
      console.log('Final Kingdom State:', user.kingdom);
  
      res.status(200).json({
        message: `You ${result} the battle!`,
        goldEarned: result === 'win' ? dungeon.reward.gold : 0,
        unitsLost: casualties,
        battleLog: battleLog,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  module.exports = router;
  