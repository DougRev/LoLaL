const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  speed: { type: Number, required: true },
  health: { type: Number, required: true },
  tier: {
    type: String,
    enum: ['Basic', 'Intermediate', 'Advanced', 'Elite', 'Mythic'],
    required: true,
  },
  image: { type: String },
});

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;
