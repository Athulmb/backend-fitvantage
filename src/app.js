const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const googleAuth = require('./routes/googleAuth')
const serviceRoutes = require('./routes/service.routes');
const programRoutes = require('./routes/program.routes')
const centerRoutes = require('./routes/center.routes')
const sportsRoutes = require('./routes/sport.routes')
const storyRoutes = require('./routes/userStory.routes')  
const pricingRoutes = require('./routes/pricing.routes')  
const aboutRoutes = require('./routes/about.routes')
const blogRoutes = require('./routes/blog.routes')










const app = express();
// app.use(cookieParser());
const PORT = process.env.PORT || 7000;

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3005'],
  credentials: true
}));

// Middleware
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/googleAuth', googleAuth);   // google oauth

// Routes
app.use("/api/services", serviceRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/sports", sportsRoutes);
app.use("/api/userstory", storyRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/blog", blogRoutes);









// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;



