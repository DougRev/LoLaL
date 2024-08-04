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
    console.log('Fetching kingdom with ID:', req.params.id);
    const kingdom = await updateGoldProduction(req.params.id);
    console.log('Fetched kingdom:', kingdom);

    if (!kingdom) {
      return res.status(404).json({ message: 'Kingdom not found' });
    }

    await updateActionPoints(kingdom._id);
    res.status(200).json(kingdom);
  } catch (error) {
    console.error('Error fetching kingdom:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getKingdomById = async (req, res) => {
  try {
    const kingdom = await Kingdom.findById(req.params.id).populate('owner');
    if (!kingdom) {
      console.error(`No kingdom found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Kingdom not found' });
    }
    res.json(kingdom);
  } catch (err) {
    console.error(`Error fetching kingdom with ID: ${req.params.id}`, err);
    res.status(500).json({ message: 'Server error' });
  }
};

const upgradeVault = async (req, res) => {
  const { userId } = req.body;

  try {
    const kingdom = await Kingdom.findOne({ user: userId });
    if (!kingdom) {
      return res.status(404).json({ message: 'Kingdom not found' });
    }

    const currentLevel = kingdom.vault.level || 0;
    const nextLevel = currentLevel + 1;
    const upgradeCost = nextLevel * 1000; // Example cost formula

    if (kingdom.gold < upgradeCost) {
      return res.status(400).json({ message: 'Not enough gold for upgrade' });
    }

    kingdom.gold -= upgradeCost;
    kingdom.vault.level = nextLevel;
    kingdom.vault.capacity = (kingdom.vault.capacity || 0) + nextLevel * 500; // Example capacity increase

    await kingdom.save();

    res.json(kingdom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const depositGold = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const kingdom = await Kingdom.findOne({ user: userId });
    if (!kingdom) {
      return res.status(404).json({ message: 'Kingdom not found' });
    }

    if (kingdom.gold < amount) {
      return res.status(400).json({ message: 'Not enough gold to deposit' });
    }

    if (kingdom.vaultGold + amount > kingdom.vault.capacity) {
      return res.status(400).json({ message: 'Vault capacity exceeded' });
    }

    kingdom.gold -= amount;
    kingdom.vaultGold += amount;

    await kingdom.save();

    res.json(kingdom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const withdrawGold = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const kingdom = await Kingdom.findOne({ user: userId });
    if (!kingdom) {
      return res.status(404).json({ message: 'Kingdom not found' });
    }

    if (kingdom.vaultGold < amount) {
      return res.status(400).json({ message: 'Not enough gold in vault' });
    }

    kingdom.gold += amount;
    kingdom.vaultGold -= amount;

    await kingdom.save();

    res.json(kingdom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getKingdom,
  getKingdomById,
  upgradeVault,
  depositGold,
  withdrawGold,
};
