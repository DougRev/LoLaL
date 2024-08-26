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
  capacity: { type: Number, default: 10000 },
});

const KingdomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faction: { type: mongoose.Schema.Types.ObjectId, ref: 'Faction' },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  gold: { type: Number, default: 10000 },
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
  wallFortifications: { type: UpgradeSchema, default: { level: 0, name: 'Wall Fortifications', cost: 100, bonus: 10 } },
  vault: { type: VaultSchema, default: { level: 1, capacity: 10000 } },
  trainingGrounds: { type: UpgradeSchema, default: { level: 0, name: 'Training Grounds', cost: 200, bonus: 1.05 } },
  goldProduction: { type: UpgradeSchema, default: { level: 1, name: 'Gold Production', cost: 150, bonus: 500 } },
  ancientStudies: { type: UpgradeSchema, default: { level: 0, name: 'Ancient Studies', cost: 500, bonus: 1.1 } } // For rune buffs
}, { timestamps: true });


KingdomSchema.pre('save', async function(next) {
  const kingdom = this;

  next();
});

module.exports = mongoose.model('Kingdom', KingdomSchema);
