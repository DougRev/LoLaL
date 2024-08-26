const Kingdom = require('../models/Kingdom');
const User = require('../models/User');
const { determineNextUnitUnlock, upgradeFormulas } = require('../utils/upgradeFormulas');

// Handle purchasing an upgrade
const purchaseUpgrade = async (req, res) => {
  const { userId, upgradeType } = req.body;

  try {
    console.log(`User ${userId} is attempting to purchase upgrade: ${upgradeType}`);

    const user = await User.findById(userId).populate('kingdom');
    const kingdom = user.kingdom;

    if (!kingdom) {
      console.log('Kingdom not found for user:', userId);
      return res.status(404).json({ message: 'Kingdom not found' });
    }

    let currentLevel = kingdom[upgradeType]?.level || 0;

    console.log(`Current level for ${upgradeType}: ${currentLevel}`);

    // Use dynamic formulas to get the next upgrade
    const nextUpgrade = await upgradeFormulas[upgradeType](currentLevel + 1); // Await the async result

    console.log(`Next upgrade details:`, nextUpgrade);

    if (!nextUpgrade) {
      console.log('No further upgrades available for this type');
      return res.status(400).json({ message: 'Max level reached. No further upgrades available for this type.' });
    }    

    if (kingdom.gold < nextUpgrade.cost) {
      console.log('Not enough gold for this upgrade');
      return res.status(400).json({ message: 'You do not have enough gold to purchase this upgrade.', requiredGold: nextUpgrade.cost });
    }

    // Deduct the cost and apply the upgrade
    kingdom.gold -= nextUpgrade.cost;

    console.log(`Gold deducted. New gold amount: ${kingdom.gold}`);

    // Apply the upgrade logic
    if (upgradeType === 'trainingGrounds') {
      // Ensure user stats are initialized if they don't already exist
      if (!user.stats) {
        user.stats = { total: { speed: 1 } };
      } else if (!user.stats.total) {
        user.stats.total = { speed: 1 };
      } else if (!user.stats.total.speed) {
        user.stats.total.speed = 1;
      }
      
      // Now apply the bonus
      user.stats.total.speed *= nextUpgrade.bonus;
    }

    if (upgradeType === 'vault') {
      kingdom.vault.level += 1;
      kingdom.vault.capacity += nextUpgrade.bonus;
    } else if (upgradeType === 'goldProduction') {
      kingdom.goldProductionRate += nextUpgrade.bonus;
    } else if (upgradeType === 'barracks') {
      kingdom.barracks.level = currentLevel + 1;

      // Determine the next unlocked unit
      const unlockedUnit = await determineNextUnitUnlock(kingdom.barracks.level);
      if (unlockedUnit) {
          kingdom.army.push({
              unit: unlockedUnit._id,
              quantity: 0,
          });
      }
    } else {
      kingdom[upgradeType] = {
        level: currentLevel + 1,
        name: nextUpgrade.name,
        cost: nextUpgrade.cost,
        bonus: nextUpgrade.bonus,
      };

      // Update stats based on the upgrade type
      if (upgradeType === 'wallFortifications') {
        kingdom.defensiveStats *= nextUpgrade.bonus;
      } else if (upgradeType === 'trainingGrounds') {
        user.stats.total.speed *= nextUpgrade.bonus; // Apply speed multiplier
      } else if (upgradeType === 'ancientStudies') {
        user.stats.runes.attack *= nextUpgrade.bonus;
        user.stats.runes.defense *= nextUpgrade.bonus;
        user.stats.runes.speed *= nextUpgrade.bonus;
        user.stats.runes.health *= nextUpgrade.bonus;
      }
    }

    await kingdom.save();
    await user.save();

    console.log('Upgrade successful. Kingdom saved.');

    res.status(200).json(kingdom);
  } catch (err) {
    console.error('Error during upgrade purchase:', err);
    res.status(500).json({ message: 'An error occurred while processing the upgrade.' });
  }
};

// Get details of the next upgrade for a given type and level
const getNextUpgrade = async (req, res) => {
  const { upgradeType, level } = req.query;

  try {
    const nextUpgrade = await upgradeFormulas[upgradeType](parseInt(level) + 1);

    if (!nextUpgrade) {
      return res.status(400).json({ message: 'Max level reached. No further upgrades available for this type.' });
    }

    // For barracks, include `nextUnlock`
    if (upgradeType === 'barracks') {
      const nextUnit = await determineNextUnitUnlock(parseInt(level) + 1);
      if (nextUnit) {
        nextUpgrade.nextUnlock = nextUnit.name; // Ensure this is correctly assigned
      } else {
        nextUpgrade.nextUnlock = 'No further units available'; // Properly handle no more units
      }
      console.log('Next Unit Unlock for Barracks:', nextUpgrade.nextUnlock); // Debug log
    }

    res.status(200).json(nextUpgrade);
  } catch (err) {
    console.error('Error in getNextUpgrade:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  purchaseUpgrade,
  getNextUpgrade,
};
