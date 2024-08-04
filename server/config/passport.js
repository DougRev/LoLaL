const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Kingdom = require('../models/Kingdom'); // Import Kingdom model
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
        name: profile.displayName || profile.name.givenName || profile.name.familyName || '', // Use profile.displayName or name components
      });

      if (!user.name) {
        await user.save();
        return done(null, { id: user._id, needsUsername: true });
      }

      await user.save();

      // Create a kingdom for the new user
      const kingdom = new Kingdom({
        user: user._id,
        name: `${user.name}'s Kingdom`,
        gold: 1000, // Initial gold amount
        // other initial fields...
      });

      await kingdom.save();

      user.kingdom = kingdom._id;
      await user.save();
    }

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
