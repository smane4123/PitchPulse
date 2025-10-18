// PITCHPULSE/backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const turfRoutes = require('./routes/turfRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // <-- 1. IMPORT review routes

const app = express();

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json()); // JSON body parser

// Serve static files (images) from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// Note: You only need one line for serving uploads
// app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); // <-- This line is duplicated, remove one
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes); // <-- 2. USE the review routes

// Root route to check server status
app.get('/', (req, res) => {
    res.send('PitchPulse Backend API is running!');
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));