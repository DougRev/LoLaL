const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const { auth } = require('./middleware/auth');
const Faction = require('./models/Faction');
const kingdomRoutes = require('./routes/kingdomRoutes');
const unitRoutes = require('./routes/unitRoutes');
const dungeonRoutes = require('./routes/dungeonRoutes');
const factionRoutes = require('./routes/factionRoutes');
const userRoutes = require('./routes/userRoutes');
const regionRoutes = require('./routes/regionRoutes');
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
app.use('/api/users', userRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/kingdoms', kingdomRoutes); 
app.use('/api/upgrades', require('./routes/upgradeRoutes'));
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/factions', factionRoutes);
app.use('/api/regions',regionRoutes);

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

// Generic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Create predefined factions
async function createDefaultFactions() {
  try {
    const factions = [
      {
        name: 'Warrior Brotherhood',
        description: 'A faction focused on brute strength and battlefield dominance.',
        advantage: '+10% bonus to all offensive stats.',
        disadvantage: '-10% reduction in defensive structures effectiveness.',
        image: 'URL_to_warrior_image'
      },
      {
        name: 'Arcane Alliance',
        description: 'Masters of magic and strategy, they excel in using magical runes.',
        advantage: '+10% bonus to all rune stats (attack, defense, speed, health).',
        disadvantage: '-10% reduction in physical army effectiveness.',
        image: 'URL_to_arcane_image'
      },
      {
        name: 'Defensive Coalition',
        description: 'A faction that prioritizes defense and resilience.',
        advantage: '+15% bonus to defensive structures and wall fortifications.',
        disadvantage: '-10% reduction in gold production rate.',
        image: 'URL_to_defensive_image'
      },
      {
        name: 'Trade Consortium',
        description: 'Wealthy traders who focus on gold production and economic power.',
        advantage: '+20% increase in gold production rate.',
        disadvantage: '-10% reduction in army and defensive structures’ effectiveness.',
        image: 'URL_to_trade_image'
      },
      {
        name: 'Nomadic Raiders',
        description: 'Agile and quick, they favor mobility and rapid strikes.',
        advantage: '+10% bonus to speed and a chance to raid extra gold from attacks.',
        disadvantage: '-10% reduction in health and defensive stats.',
        image: 'URL_to_nomadic_image'
      }
    ];

    for (const faction of factions) {
      const existingFaction = await Faction.findOne({ name: faction.name });
      if (!existingFaction) {
        await Faction.create(faction);
        console.log(`${faction.name} created.`);
      } else {
        console.log(`${faction.name} already exists.`);
      }
    }
  } catch (error) {
    console.error('Error creating predefined factions:', error);
  }
}

// Call the function during server startup
//createDefaultFactions();
