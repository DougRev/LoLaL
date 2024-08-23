const User = require('../models/User');
const Kingdom = require('../models/Kingdom');
const BattleLog = require('../models/BattleLog');
const { calculateBattleOutcome, processPvPCasualties } = require('../utils/battleUtils');

// Helper function to calculate gold stolen based on defender’s available gold
const calculateGoldStolen = (attacker, defender, baseAmount) => {
  const stealableGold = Math.min(baseAmount, defender.kingdom.gold);
  return Math.floor(stealableGold * (0.5 + Math.random() * 0.85)); 
};

// Controller function to start a PvP battle
const startPvPBattle = async (req, res) => {
  const { attackerId, defenderId, attackingUnits } = req.body;

  try {
    const attacker = await User.findById(attackerId).populate('kingdom');
    const defender = await User.findById(defenderId).populate('kingdom');

    if (!attacker || !defender) {
      return res.status(404).json({ message: 'Attacker or Defender not found.' });
    }

    if (attacker.kingdom.actionPoints <= 0) {
      return res.status(400).json({ message: 'Not enough action points to attack.' });
    }

    // Deduct action points from attacker
    attacker.kingdom.actionPoints -= 1;

    // Fetch details for the attacking units
    const unitDetails = await Unit.find({ _id: { $in: Object.keys(attackingUnits) } });

    // Prepare attacker and defender units for battle logic
    const battleUnits = unitDetails.map((unitDetail) => ({
      unitId: unitDetail._id.toString(),
      name: unitDetail.name,
      attack: unitDetail.attack,
      defense: unitDetail.defense,
      speed: unitDetail.speed,
      health: unitDetail.health,
      quantity: attackingUnits[unitDetail._id.toString()],
    }));

    // Combine attacker and defender details into the battle calculation
    const { result, attackerHealth, defenderHealth, battleLog, killedUnits } =
    calculateBattleOutcome(battleUnits, attacker, defender);

    // Process casualties for both sides
    const attackerUnitsLost = await processPvPCasualties(attacker._id, killedUnits.attacker);
    const defenderUnitsLost = await processPvPCasualties(defender._id, killedUnits.defender);

    let goldStolen = 0;
    if (result === 'attackerWins') {
      goldStolen = calculateGoldStolen(attacker, defender, defender.kingdom.gold);
      attacker.kingdom.gold += goldStolen;
      defender.kingdom.gold -= goldStolen;
    }

    // Save the updated kingdoms
    await attacker.kingdom.save();
    await defender.kingdom.save();

    // Optionally log the battle in a BattleLog
    await BattleLog.create({
      attacker: attacker._id,
      defender: defender._id,
      attackerKingdom: attacker.kingdom._id,
      defenderKingdom: defender.kingdom._id,
      goldStolen,
      outcome: result === 'attackerWins' ? 'attackerWins' : 'defenderWins',
    });

    res.status(200).json({
      message: result === 'attackerWins' ? 'You won the battle!' : 'You lost the battle.',
      result,
      goldStolen,
      attackerUnitsLost,
      defenderUnitsLost,
      battleLog,
    });
  } catch (error) {
    console.error('Error in PvP battle:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Optional: Get a user's PvP logs
const getPvPLog = async (req, res) => {
  const { userId } = req.params;

  try {
    const logs = await BattleLog.find({
      $or: [{ attacker: userId }, { defender: userId }],
    })
      .populate('attacker', 'name')
      .populate('defender', 'name')
      .sort({ date: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching PvP logs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  startPvPBattle,
  getPvPLog,
};
