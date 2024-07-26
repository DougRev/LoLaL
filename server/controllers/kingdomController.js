const Kingdom = require('../models/Kingdom');

const updateGoldProduction = async (kingdomId) => {
  const kingdom = await Kingdom.findById(kingdomId);
  const now = Date.now();
  const elapsed = now - new Date(kingdom.lastGoldCollection).getTime();

  const interval = 60000; // 1 minute
  const productionCycles = Math.floor(elapsed / interval);
  const additionalGold = productionCycles * kingdom.goldProductionRate;

  if (additionalGold > 0) {
    kingdom.gold += additionalGold;
    kingdom.lastGoldCollection = new Date(kingdom.lastGoldCollection).getTime() + productionCycles * interval;
    await kingdom.save();
  }

  return kingdom;
};

const updateActionPoints = async (kingdomId) => {
  const kingdom = await Kingdom.findById(kingdomId);
  const now = Date.now();
  const elapsed = now - new Date(kingdom.lastActionPointUpdate).getTime();

  const interval = 300000; // 5 minutes
  const productionCycles = Math.floor(elapsed / interval);
  const additionalPoints = productionCycles;

  if (additionalPoints > 0) {
    kingdom.actionPoints += additionalPoints;
    kingdom.lastActionPointUpdate = new Date(kingdom.lastActionPointUpdate).getTime() + productionCycles * interval;
    await kingdom.save();
  }

  return kingdom;
};

const getKingdom = async (req, res) => {
  try {
    const kingdom = await updateGoldProduction(req.params.id);
    await updateActionPoints(kingdom._id);
    res.status(200).json(kingdom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getKingdom };
