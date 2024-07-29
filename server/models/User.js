const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  faction: { type: String, enum: ['Faction1', 'Faction2', 'Faction3'] },
  kingdom: { type: mongoose.Schema.Types.ObjectId, ref: 'Kingdom' },
  highestDungeonCompleted: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
