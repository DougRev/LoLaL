const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminMiddleware');
const Faction = require('./models/Faction');

const unitRoutes = require('./routes/unitRoutes');
const dungeonRoutes = require('./routes/dungeonRoutes');
const factionRoutes = require('./routes/factionRoutes');
const pvpRoutes = require('./routes/pvpRoutes');

require('./config/passport');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET, 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session()); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', auth, adminAuth, require('./routes/adminRoutes')); 
app.use('/api/units', unitRoutes);
app.use('/api/kingdoms', require('./routes/kingdomRoutes'));
app.use('/api/upgrades', require('./routes/upgradeRoutes'));
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/factions', factionRoutes);
app.use('/api/pvp', pvpRoutes);

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = req.user.token;
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.redirect(`http://localhost:3000/dashboard?token=${token}`); 
});

app.get('/api/protected', auth, (req, res) => {
  res.json({ msg: 'This is a protected route', user: req.user });
});

app.get('/api/checkAuth', auth, (req, res) => {
  res.json({ token: req.cookies.token });
});

app.get('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


async function createDefaultFaction() {
  try {
      const existingFaction = await Faction.findOne({ name: 'Default Faction' });
      if (!existingFaction) {
          const defaultFaction = new Faction({
              name: 'Default Faction',
              description: 'This is the default faction.',
              advantage: 'No specific advantages.',
              disadvantage: 'No specific disadvantages.',
              image: 'default-image-url' // Provide a default image URL or path
          });
          await defaultFaction.save();
          console.log('Default Faction created.');
      } else {
          console.log('Default Faction already exists.');
      }
  } catch (error) {
      console.error('Error creating default faction:', error);
  }
}

// Call the function during server startup
//createDefaultFaction();