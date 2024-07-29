const mongoose = require('mongoose');

const bossSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  health: { type: Number, required: true } 
});

const rewardSchema = new mongoose.Schema({
  gold: { type: Number, required: true },
  other: { type: String }
});

const dungeonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  boss: { type: bossSchema, required: true },
  reward: { type: rewardSchema, required: true }
});

module.exports = mongoose.model('Dungeon', dungeonSchema);
