const mongoose = require('mongoose');

const FactionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  advantage: { type: String, required: true },
  disadvantage: { type: String, required: true },
  image: { type: String } // URL or path to the image
}, { timestamps: true });

module.exports = mongoose.model('Faction', FactionSchema);
