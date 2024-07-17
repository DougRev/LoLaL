const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth'); // Correct path
require('./config/passport');

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    res.cookie('token', req.user.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect('http://localhost:3000/dashboard');
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
