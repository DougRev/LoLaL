const Unit = require('../models/Unit');

const determineNextUnitUnlock = async (level) => {
  try {
    console.log(`Determining next unit unlock for barracks level: ${level}`);
    const units = await Unit.find().sort({ barracksLevel: 1 });
    console.log('Fetched units:', units);

    const nextUnit = units.find((unit) => unit.barracksLevel === level);
    console.log(`Next unit at level ${level}:`, nextUnit);

    return nextUnit; // Make sure this returns the full unit object, not just the name.
  } catch (error) {
    console.error('Error determining next unit unlock:', error);
    return null;
  }
};

const upgradeFormulas = {
  barracks: async (level) => {
    console.log(`Calculating barracks upgrade for level ${level}`);
    const nextUnitUnlock = await determineNextUnitUnlock(level + 1); // Note: level + 1 for the next unlock
    console.log(`Next unit to unlock: ${nextUnitUnlock}`);

    if (!nextUnitUnlock) {
      return null; // Indicate that the upgrade is maxed out
    }

    return {
      name: `Barracks Level ${level}`,
      cost: 100 * level,
      nextUnlock: nextUnitUnlock || 'No further units available', // Ensure fallback if undefined
    };
  },
  wallFortifications: (level) => ({
    name: `Wall Fortifications Level ${level}`,
    cost: 150 * level,
    // Diminishing returns formula for defensive multiplier
    bonus: 1 + 0.02 * (1 - Math.exp(-0.1 * level)),
  }),
  trainingGrounds: (level) => ({
    name: `Training Grounds Level ${level}`,
    cost: 200 * level,
    // Diminishing returns formula for speed multiplier
    bonus: 1 + 0.02 * (1 - Math.exp(-0.1 * level)),
  }),
  goldProduction: (level) => ({
    name: `Gold Production Level ${level}`,
    cost: 250 * level,
    bonus: 500 * level, // Additional gold produced per level (linear growth)
  }),
  vault: (level) => ({
    name: `Vault Level ${level}`,
    cost: 300 * level,
    bonus: 10000 * level, // Additional vault capacity per level (linear growth)
  }),
  ancientStudies: (level) => ({
    name: `Ancient Studies Level ${level}`,
    cost: 500 * level,
    // Diminishing returns formula for rune buff multiplier
    bonus: 1 + 0.03 * (1 - Math.exp(-0.05 * level)),
  }),
};

module.exports = { determineNextUnitUnlock, upgradeFormulas };
