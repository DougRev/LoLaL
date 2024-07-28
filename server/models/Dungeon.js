const mongoose = require('mongoose');

const DungeonSchema = new mongoose.Schema({
  name: { type: String, default: 'Unknown Dungeon' },
  level: { type: Number, required: true },
  boss: {
    name: { type: String, required: true },
    attack: { type: Number, required: true },
    defense: { type: Number, required: true },
  },
  reward: {
    gold: { type: Number, required: true },
    other: { type: String },
  },
}, { timestamps: true });

module.exports = mongoose.model('Dungeon', DungeonSchema);
