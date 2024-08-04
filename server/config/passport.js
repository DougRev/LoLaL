const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        // No username set yet, we redirect them later to set it.
      });
      await user.save();
    }

    // If user.name is not set, redirect them to set it.
    if (!user.name) {
      return done(null, { id: user._id, needsUsername: true });
    }

    const payload = { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return done(null, { token });
  } catch (err) {
    return done(err, false);
  }
}));
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
