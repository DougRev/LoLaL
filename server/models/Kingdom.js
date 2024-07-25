const mongoose = require('mongoose');

const ArmySchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  quantity: { type: Number, default: 0 },
  assignedTo: { type: String, enum: ['offensive', 'defensive', 'unassigned'], default: 'unassigned' }
});

const KingdomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  gold: { type: Number, default: 0 },
  army: [ArmySchema],
  offensiveGear: { type: Number, default: 0 },
  defensiveStructures: { type: Number, default: 0 },
  offensiveStats: { type: Number, default: 0 },
  defensiveStats: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Kingdom', KingdomSchema);
