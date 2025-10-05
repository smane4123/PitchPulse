// PITCHPULSE/backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // <--- 1. Import 'path' module
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const turfRoutes = require('./routes/turfRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// --- Middleware ---
app.use(cors({
    // Allow frontend from localhost:3000 to connect
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json()); // JSON body parser

// 🚨 CRITICAL ADDITION: Serve static files (images) from the 'uploads' folder
// This makes the images publicly accessible via http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // <--- 2. Serve uploads publicly

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- API Routes ---
// Mount routes under /api namespace
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);

// Root route to check server status
app.get('/', (req, res) => {
    res.send('PitchPulse Backend API is running!');
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));