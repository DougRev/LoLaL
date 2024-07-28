const mongoose = require('mongoose');

const ArmySchema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  quantity: { type: Number, default: 0 },
  assignedTo: { type: String, enum: ['offensive', 'defensive', 'unassigned'], default: 'unassigned' }
});

const UpgradeSchema = new mongoose.Schema({
  level: { type: Number, default: 1 },
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  bonus: { type: Number, default: 0 }
});

const VaultSchema = new mongoose.Schema({
  level: { type: Number, default: 1 },
  capacity: { type: Number, default: 1000 },
});

const KingdomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  gold: { type: Number, default: 0 },
  goldProductionRate: { type: Number, default: 10 }, 
  lastGoldCollection: { type: Date, default: Date.now }, 
  actionPoints: { type: Number, default: 50 },
  lastActionPointUpdate: { type: Date, default: Date.now },
  army: [ArmySchema],
  offensiveGear: { type: Number, default: 0 },
  defensiveStructures: { type: Number, default: 0 },
  offensiveStats: { type: Number, default: 0 },
  defensiveStats: { type: Number, default: 0 },
  barracks: { type: UpgradeSchema, default: { level: 0, name: 'Barracks', cost: 100, bonus: 10 } },
  wallFortifications: { type: UpgradeSchema, default: { level: 0, name: 'Wall Fortification', cost: 100, bonus: 10 } },
  vault: { type: VaultSchema, default: { level: 1, capacity: 1000 } },
  vaultGold: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Kingdom', KingdomSchema);
