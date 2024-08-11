const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Kingdom = require('../models/Kingdom');
const PvPLog = require('../models/PvPLog');
const auth = require('../middleware/auth');

// Get a list of players to attack
router.get('/players', auth, async (req, res) => {
    const userId = req.user._id;
    try {
      const currentUser = await User.findById(userId).populate('faction').exec();
      console.log('Current User:', currentUser); // Log current user
      console.log('User Faction:', currentUser.faction); // Log user's faction
      
      if (!currentUser || !currentUser.faction) {
        return res.status(404).json({ error: 'Current user or faction not found' });
      }
      
      const players = await User.find({ faction: { $ne: currentUser.faction._id } }, 'name faction kingdom')
        .populate('faction', 'name')
        .populate('kingdom', 'name')
        .exec();
      
      console.log('Players:', players); // Log players list
      
      res.json(players);
    } catch (error) {
      console.error('Error fetching players:', error); // Log any errors
      res.status(500).json({ error: error.message });
    }
  });

// Attack a player
router.post('/attack', auth, async (req, res) => {
  const { attackerId, defenderId } = req.body;

  try {
    const attacker = await User.findById(attackerId).populate({
      path: 'kingdom',
      populate: { path: 'army.unit' }
    }).exec();
    
    const defender = await User.findById(defenderId).populate({
      path: 'kingdom',
      populate: { path: 'army.unit' }
    }).exec();

    if (!attacker || !defender || !attacker.kingdom || !defender.kingdom) {
      return res.status(404).json({ error: 'Attacker, defender, or their kingdom not found' });
    }

    const attackerArmy = attacker.kingdom.army.filter(unit => unit.assignedTo === 'offensive');
    const defenderArmy = defender.kingdom.army.filter(unit => unit.assignedTo === 'defensive');

    const attackStrength = attackerArmy.reduce((total, unit) => total + (unit.unit.attack * unit.quantity), 0);
    const defenseStrength = defenderArmy.reduce((total, unit) => total + (unit.unit.defense * unit.quantity), 0);

    let result = 'loss';
    let goldStolen = 0;

    if (attackStrength > defenseStrength) {
      result = 'win';
      goldStolen = Math.min(defender.kingdom.gold, attackStrength - defenseStrength);
      defender.kingdom.gold -= goldStolen;
      attacker.kingdom.gold += goldStolen;
    }

    await attacker.kingdom.save();
    await defender.kingdom.save();

    const pvpLog = new PvPLog({
      attacker: attackerId,
      defender: defenderId,
      attackerUnits: attackerArmy.map(unit => unit.unit._id),
      defenderUnits: defenderArmy.map(unit => unit.unit._id),
      result,
      goldStolen,
    });

    await pvpLog.save();

    res.json({ result, goldStolen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
