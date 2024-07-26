const express = require('express');
const router = express.Router();
const Kingdom = require('../models/Kingdom');
const User = require('../models/User');

// Predefined upgrade options for simplicity
const upgrades = {
  barracks: [
    { level: 1, name: 'Barracks Level 1', cost: 100, bonus: 10 },
    { level: 2, name: 'Barracks Level 2', cost: 200, bonus: 20 },
    { level: 3, name: 'Barracks Level 3', cost: 300, bonus: 30 },
    { level: 4, name: 'Barracks Level 4', cost: 400, bonus: 40 },
    { level: 5, name: 'Barracks Level 5', cost: 500, bonus: 50 }

  ],
  wallFortifications: [
    { level: 1, name: 'Wooden Palisade', cost: 100, bonus: 10 },
    { level: 2, name: 'Stone Wall', cost: 500, bonus: 50 },
    { level: 3, name: 'Fortress Wall', cost: 1000, bonus: 100 },
    { level: 4, name: 'Fortress Wall 2', cost: 2000, bonus: 200 },
    { level: 5, name: 'Fortress Wall 3', cost: 3000, bonus: 300 }
  ]
};

router.post('/purchase-upgrade', async (req, res) => {
  const { userId, upgradeType } = req.body;

  try {
    const user = await User.findById(userId).populate('kingdom');
    const kingdom = user.kingdom;

    if (!kingdom) {
      return res.status(404).json({ message: 'Kingdom not found' });
    }

    const currentLevel = kingdom[upgradeType].level;
    const nextUpgrade = upgrades[upgradeType].find(upg => upg.level === currentLevel + 1);

    if (!nextUpgrade) {
      return res.status(400).json({ message: 'No further upgrades available' });
    }

    if (kingdom.gold < nextUpgrade.cost) {
      return res.status(400).json({ message: 'Not enough gold' });
    }

    kingdom.gold -= nextUpgrade.cost;
    kingdom[upgradeType] = nextUpgrade;

    if (upgradeType === 'barracks') {
      kingdom.offensiveStats += nextUpgrade.bonus;
    } else if (upgradeType === 'wallFortifications') {
      kingdom.defensiveStats += nextUpgrade.bonus;
    }

    await kingdom.save();

    res.status(200).json(kingdom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
