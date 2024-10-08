const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  description: { type: String }, 
  image: { type: String }, 
});

module.exports = mongoose.model('Region', regionSchema);
