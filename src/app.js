const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const googleAuth = require('./routes/googleAuth');
const serviceRoutes = require('./routes/service.routes');
const programRoutes = require('./routes/program.routes');
const centerRoutes = require('./routes/center.routes');
const sportsRoutes = require('./routes/sport.routes');
const storyRoutes = require('./routes/userStory.routes');
const pricingRoutes = require('./routes/pricing.routes');
const aboutRoutes = require('./routes/about.routes');
const blogRoutes = require('./routes/blog.routes');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/googleAuth', googleAuth);
app.use('/api/services', serviceRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/userstory', storyRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/blog', blogRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend Fitvantage API is running 🚀");
});

module.exports = app;
