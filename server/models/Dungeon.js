const mongoose = require('mongoose');

const bossSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  health: { type: Number, required: true } 
});

const rewardSchema = new mongoose.Schema({
    gold: { type: Number, required: true },
    runes: {
      common: { type: Number, default: 0.6 },   // 60% chance
      uncommon: { type: Number, default: 0.25 }, // 25% chance
      rare: { type: Number, default: 0.1 },      // 10% chance
      epic: { type: Number, default: 0.04 },     // 4% chance
      legendary: { type: Number, default: 0.01 } // 1% chance
    }
  });
  
const dungeonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  boss: { type: bossSchema, required: true },
  reward: { type: rewardSchema, required: true }
});

module.exports = mongoose.model('Dungeon', dungeonSchema);
