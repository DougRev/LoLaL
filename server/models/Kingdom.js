const mongoose = require('mongoose');

const KingdomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  gold: { type: Number, default: 0 },
  army: { type: Number, default: 0 },
  offensiveGear: { type: Number, default: 0 },
  defensiveStructures: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Kingdom', KingdomSchema);
