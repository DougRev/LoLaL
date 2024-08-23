const mongoose = require('mongoose');

const BattleLogSchema = new mongoose.Schema({
  attacker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attackerKingdom: { type: mongoose.Schema.Types.ObjectId, ref: 'Kingdom', required: true },
  defenderKingdom: { type: mongoose.Schema.Types.ObjectId, ref: 'Kingdom', required: true },
  goldStolen: { type: Number, default: 0 },
  outcome: { type: String, enum: ['attackerWins', 'defenderWins'], required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('BattleLog', BattleLogSchema);
