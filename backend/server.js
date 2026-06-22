const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');


const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const visitorRoutes = require('./src/routes/visitorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const passRoutes = require('./src/routes/passRoutes');
const checkLogRoutes = require('./src/routes/checkLogRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();


connectDB();


app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));


app.use(cors({
  origin: function (origin, callback) {
    // Dynamically allow all origins to bypass strict CORS issues during deployment
    callback(null, true);
  },
  credentials: true,
}));


if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { success: false, message: 'Too many attempts, please try again after 15 minutes' },
});


app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/checklogs', checkLogRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'VPass API is running', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/health`);
});
