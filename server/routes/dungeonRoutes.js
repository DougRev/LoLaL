const express = require('express');
const router = express.Router();
const Dungeon = require('../models/Dungeon');
const User = require('../models/User');
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

const calculateBattleOutcome = (units, dungeon) => {
    let playerAttack = 0;
    let playerDefense = 0;
  
    units.forEach(unit => {
      playerAttack += unit.attack * unit.quantity;
      playerDefense += unit.defense * unit.quantity;
    });
  
    const bossAttack = dungeon.boss.attack;
    const bossDefense = dungeon.boss.defense;
  
    let result = 'lose';
    if (playerAttack > bossDefense) {
      result = 'win';
    } else if (playerDefense > bossAttack) {
      result = 'draw';
    }
  
    return { result, playerAttack, playerDefense, bossAttack, bossDefense };
  };
  
  const calculateCasualties = (units, result) => {
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
  
      const armyUnits = user.kingdom.army.filter(armyUnit => units[armyUnit.unit.toString()]);
      const battleUnits = armyUnits.map(armyUnit => ({
        unitId: armyUnit.unit.toString(),
        attack: armyUnit.unit.attack,
        defense: armyUnit.unit.defense,
        quantity: units[armyUnit.unit.toString()],
      }));
  
      const { result, playerAttack, playerDefense, bossAttack, bossDefense } = calculateBattleOutcome(battleUnits, dungeon);
      const casualties = calculateCasualties(battleUnits, result);
  
      battleUnits.forEach(unit => {
        const armyUnit = user.kingdom.army.find(armyUnit => armyUnit.unit.toString() === unit.unitId);
        armyUnit.quantity -= casualties[unit.unitId];
      });
  
      if (result === 'win') {
        user.kingdom.gold += dungeon.reward.gold;
      }
  
      await user.kingdom.save();
  
      res.status(200).json({
        message: `You ${result} the battle!`,
        goldEarned: result === 'win' ? dungeon.reward.gold : 0,
        unitsLost: casualties,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

module.exports = router;
