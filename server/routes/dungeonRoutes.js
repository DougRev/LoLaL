const express = require('express');
const router = express.Router();
const Dungeon = require('../models/Dungeon');
const User = require('../models/User');
const Unit = require('../models/Unit');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminMiddleware');

// Get all dungeons the user is eligible to see
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const highestDungeonCompleted = user.highestDungeonCompleted || 0;

    const dungeons = await Dungeon.find({ level: { $lte: highestDungeonCompleted + 1 } });
    res.json(dungeons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all dungeons for admin
router.get('/all', [auth, admin], async (req, res) => {
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
  let bossHealth = dungeon.boss.health; // Initialize boss health

  units.forEach(unit => {
    playerAttack += unit.attack * unit.quantity;
    playerDefense += unit.defense * unit.quantity;
  });

  const bossAttack = dungeon.boss.attack;
  const bossDefense = dungeon.boss.defense;
  const bossSpeed = dungeon.boss.speed || 1; // Speed advantage for boss

  let playerSpeed = 1; // Constant speed for player's units
  let playerHealth = playerDefense;

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

  return { result, playerAttack, playerDefense, bossAttack, bossDefense, bossHealth, battleLog };
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
const generateRune = (tier) => {
    // Define the possible buff ranges based on the rune's tier
    const buffRanges = {
      common: { min: 1, max: 3 },
      uncommon: { min: 3, max: 6 },
      rare: { min: 6, max: 10 },
      epic: { min: 10, max: 15 },
      legendary: { min: 15, max: 20 }
    };
  
    // Get the buff range for the given tier
    const { min, max } = buffRanges[tier] || { min: 0, max: 0 };
  
    // Generate random buffs within the range
    const randomBuff = () => Math.floor(Math.random() * (max - min + 1)) + min;
  
    // Create the rune object with random buffs
    const rune = {
      tier: tier,
      buffs: {
        attack: randomBuff(),
        defense: randomBuff(),
        speed: randomBuff(),
        health: randomBuff()
      }
    };
  
    return rune;
  };
  
  const determineRuneDrop = (reward) => {
    const rand = Math.random();
    let cumulative = 0;
    for (const [tier, rate] of Object.entries(reward.runes)) {
      cumulative += rate;
      if (rand <= cumulative) {
        return generateRune(tier); // Call the generateRune function
      }
    }
    return null; // No rune dropped
  };
  

  const applyRune = (user, rune) => {
    if (!rune) return;
    
    user.stats.runes.attack += rune.buffs.attack;
    user.stats.runes.defense += rune.buffs.defense;
    user.stats.runes.speed += rune.buffs.speed;
    user.stats.runes.health += rune.buffs.health;
  
    // Recalculate total stats
    user.stats.total.attack = user.stats.base.attack + user.stats.runes.attack;
    user.stats.total.defense = user.stats.base.defense + user.stats.runes.defense;
    user.stats.total.speed = user.stats.base.speed + user.stats.runes.speed;
    user.stats.total.health = user.stats.base.health + user.stats.runes.health;
  };
  
  

router.post('/battle', async (req, res) => {
    const { userId, dungeonId, units } = req.body;
  
    try {
      const user = await User.findById(userId).populate('kingdom');
      const dungeon = await Dungeon.findById(dungeonId);
  
      if (!user || !dungeon) {
        return res.status(404).json({ message: 'User or dungeon not found' });
      }
  
      const unitDetails = await Unit.find({ _id: { $in: Object.keys(units) } });
  
      const battleUnits = unitDetails.map(unitDetail => ({
        unitId: unitDetail._id.toString(),
        attack: unitDetail.attack,
        defense: unitDetail.defense,
        quantity: units[unitDetail._id.toString()],
      }));
  
      const { result, battleLog } = calculateTurnBasedBattleOutcome(battleUnits, dungeon);
  
      if (result === 'win') {
        user.kingdom.gold += dungeon.reward.gold;
        if (user.highestDungeonCompleted < dungeon.level) {
          user.highestDungeonCompleted = dungeon.level;
        }
  
        // Determine rune drop
        const rune = determineRuneDrop(dungeon.reward);
        applyRune(user, rune);
  
        await user.kingdom.save();
        await user.save();
  
        res.status(200).json({
          message: 'You won the battle!',
          goldEarned: dungeon.reward.gold,
          unitsLost: calculateTurnBasedCasualties(battleUnits, result),
          battleLog,
          rune: rune ? rune : null,
        });
      } else {
        res.status(200).json({
          message: 'You lost the battle.',
          goldEarned: 0,
          unitsLost: calculateTurnBasedCasualties(battleUnits, result),
          battleLog,
        });
      }
    } catch (err) {
      console.error('Error in battle:', err);
      res.status(500).json({ message: err.message });
    }
  }); 
  
  
  module.exports = router;
