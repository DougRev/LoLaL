const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // Use as username
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  faction: { type: mongoose.Schema.Types.ObjectId, ref: 'Faction' }, 
  kingdom: { type: mongoose.Schema.Types.ObjectId, ref: 'Kingdom' },
  highestRegionCompleted: { type: String, default: null},
  highestDungeonCompleted: [
    {
      regionId: { type: String }, 
      dungeonId: { type: String }
    }
  ],
    stats: {
    base: {
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      health: { type: Number, default: 100 }
    },
    runes: {
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      health: { type: Number, default: 0 }
    },
    total: {
      attack: { type: Number, default: 0 },
      defense: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      health: { type: Number, default: 100 }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
