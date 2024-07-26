const express = require('express');
const router = express.Router();
const Kingdom = require('../models/Kingdom');
const User = require('../models/User');
const upgrades = require('../../client/src/config/upgradesConfig');

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
  })

module.exports = router;
