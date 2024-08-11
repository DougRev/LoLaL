const mongoose = require('mongoose');

const pvpLogSchema = new mongoose.Schema({
  attacker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  defender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attackerUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
  defenderUnits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
  result: { type: String, required: true }, // "win" or "loss"
  goldStolen: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const PvPLog = mongoose.model('PvPLog', pvpLogSchema);
module.exports = PvPLog;
