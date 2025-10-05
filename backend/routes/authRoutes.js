// PITCHPULSE/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register user (player or owner)
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Only allow 'player' or 'owner' values, default to 'player'
        const validRole = (role === 'owner' || role === 'player') ? role : 'player';

        user = await User.create({ email, password: hashedPassword, role: validRole });

        res.status(201).json({
            message: 'Registration successful',
            _id: user._id,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Player login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, role: 'player' });

        if (user && (await bcrypt.compare(password, user.password))) {
            return res.json({
                message: 'Login successful',
                token: generateToken(user._id, user.role),
                user: { _id: user._id, email: user.email, role: user.role }
            });
        }
        res.status(401).json({ message: 'Invalid credentials or not a player account' });
    } catch (error) {
        console.error('Player login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Owner login (includes first time creation shortcut)
router.post('/owner-login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email, role: 'owner' });

        // If owner does not exist, create it
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({ email, password: hashedPassword, role: 'owner' });

            return res.json({
                message: 'Owner account created and logged in (Setup HACK)',
                token: generateToken(user._id, user.role),
                user: { _id: user._id, email: user.email, role: user.role }
            });
        }

        // If user exists, verify password
        if (user && (await bcrypt.compare(password, user.password))) {
            return res.json({
                message: 'Owner login successful',
                token: generateToken(user._id, user.role),
                user: { _id: user._id, email: user.email, role: user.role }
            });
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Owner login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
