const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  faction: { type: mongoose.Schema.Types.ObjectId, ref: 'Faction' }, 
  kingdom: { type: mongoose.Schema.Types.ObjectId, ref: 'Kingdom' },
  
  // Adjusted region and dungeon progress tracking
  regionProgress: [
    {
      regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
      completedDungeons: [
        { dungeonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dungeon' } }
      ],
      isRegionCompleted: { type: Boolean, default: false }
    }
  ],
  
  stats: {
    base: {
      attack: { type: Number, default: 10 },
      defense: { type: Number, default: 10 },
      speed: { type: Number, default: 5 },
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
  },
  
  runeCollection: {
    common: { type: Number, default: 0 },
    uncommon: { type: Number, default: 0 },
    rare: { type: Number, default: 0 },
    epic: { type: Number, default: 0 },
    legendary: { type: Number, default: 0 }
  }
}, { timestamps: true });

UserSchema.pre('save', function(next) {
  const user = this;
  // Additional logic can be added here if needed before saving the user
  next();
});

module.exports = mongoose.model('User', UserSchema);
