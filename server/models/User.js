const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
