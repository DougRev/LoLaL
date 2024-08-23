const Kingdom = require('../models/Kingdom');
const User = require('../models/User');
const upgradeFormulas = require('../utils/upgradeFormulas');

// Handle purchasing an upgrade
const purchaseUpgrade = async (req, res) => {
    const { userId, upgradeType } = req.body;
  
    try {
      const user = await User.findById(userId).populate('kingdom');
      const kingdom = user.kingdom;
  
      if (!kingdom) {
        return res.status(404).json({ message: 'Kingdom not found' });
      }
  
      let currentLevel;
      if (upgradeType === 'goldProduction') {
        currentLevel = kingdom.goldProductionRate / 10; // Assuming 10 is the base rate
      } else {
        currentLevel = kingdom[upgradeType]?.level || 0;
      }
  
      // Use dynamic formulas to get the next upgrade
      const nextUpgrade = upgradeFormulas[upgradeType](currentLevel + 1);
  
      if (!nextUpgrade) {
        return res.status(400).json({ message: 'No further upgrades available' });
      }
  
      if (kingdom.gold < nextUpgrade.cost) {
        // Send a specific response indicating insufficient gold
        return res.status(400).json({ message: 'You do not have enough gold to purchase this upgrade.', requiredGold: nextUpgrade.cost });
      }
  
      // Deduct the cost and apply the upgrade
      kingdom.gold -= nextUpgrade.cost;
  
      if (upgradeType === 'goldProduction') {
        kingdom.goldProductionRate += nextUpgrade.bonus;
      } else {
        kingdom[upgradeType] = {
          level: currentLevel + 1,
          name: nextUpgrade.name,
          cost: nextUpgrade.cost,
          bonus: nextUpgrade.bonus,
        };
  
        // Update stats based on the upgrade type
        if (upgradeType === 'barracks') {
          kingdom.offensiveStats += nextUpgrade.bonus;
        } else if (upgradeType === 'wallFortifications') {
          kingdom.defensiveStats += nextUpgrade.bonus;
        }
      }
  
      await kingdom.save();
  
      res.status(200).json(kingdom);
    } catch (err) {
      res.status(500).json({ message: 'An error occurred while processing the upgrade.' });
    }
  };
  

// Get details of the next upgrade for a given type and level
const getNextUpgrade = async (req, res) => {
  const { upgradeType, level } = req.query;

  try {
    const nextUpgrade = upgradeFormulas[upgradeType](parseInt(level) + 1);

    if (!nextUpgrade) {
      return res.status(400).json({ message: 'No further upgrades available' });
    }

    res.status(200).json(nextUpgrade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  purchaseUpgrade,
  getNextUpgrade,
};
