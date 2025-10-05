// PITCHPULSE/backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/bookings (Create a new booking)
// @access  Private/Player
router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'player') {
        return res.status(403).json({ message: 'Only player accounts can make bookings.' });
    }

    const { turfId, date, startTime, duration } = req.body;

    try {
        // 1. Validate turf and calculate price
        const turf = await Turf.findById(turfId);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }
        const totalPrice = turf.pricePerHour * duration;  // correct field name

        // 2. Check for time slot availability
        const existingBooking = await Booking.findOne({
            turfId,
            date: new Date(date),
            startTime,
            status: 'confirmed',
        });

        if (existingBooking) {
            return res.status(409).json({ message: 'This time slot is already booked.' });
        }

        // 3. Create the booking
        const newBooking = await Booking.create({
            turfId,
            userId: req.user.id, // ID comes from the verified JWT token
            date: new Date(date),
            startTime,
            duration,
            totalPrice,
            status: 'confirmed'
        });

        res.status(201).json({
            message: 'Booking successfully created',
            booking: newBooking,
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error during booking' });
    }
});

// @route   GET /api/bookings/user/:userId (Get player's bookings)
// @access  Private/Player
router.get('/user/:userId', protect, async (req, res) => {
    // Check if the user ID from the token matches the requested userId
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ message: 'Not authorized to view other users bookings' });
    }

    try {
        const bookings = await Booking.find({ userId: req.params.userId })
            // Populate the turfId field to get the turf's name and details
            .populate('turfId', 'name location pricePerHour') 
            .sort({ date: 1, startTime: 1 });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error while fetching user bookings' });
    }
});

module.exports = router;
