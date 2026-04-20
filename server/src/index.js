require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');
const applicationRoutes = require('./routes/applications');
const dashboardRoutes = require('./routes/dashboard');
const { startCronJobs } = require('./utils/cronJobs');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MatchTARA API is running' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`MatchTARA server running on port ${PORT}`);
  startCronJobs();
});

module.exports = app;
