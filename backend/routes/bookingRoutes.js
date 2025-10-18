// PITCHPULSE/backend/routes/bookingRoutes.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const { protect } = require('../middleware/authMiddleware');

// Helper function (unchanged)
const generateTimeSlots = (start, end) => {
    const slots = [];
    if (typeof start !== 'string' || typeof end !== 'string') {
        start = '06:00';
        end = '23:00';
    }
    let currentHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    while (currentHour < endHour) {
        slots.push(`${String(currentHour).padStart(2, '0')}:00`);
        currentHour++;
    }
    return slots;
};

// --- ROUTES ---

/**
 * @route   GET /api/bookings/availability/week
 * @desc    Get availability for a specific turf (Refined Timezone Logic)
 * @access  Public
 */
router.get('/availability/week', async (req, res) => {
    try {
        const { turfId, weekOf } = req.query; // weekOf is YYYY-MM-DD from client
        if (!turfId || !weekOf) {
            return res.status(400).json({ message: "Turf ID and week start date are required." });
        }

        const turf = await Turf.findById(turfId);
        if (!turf) {
            return res.status(404).json({ message: "Turf not found." });
        }

        const turfTimeSlots = generateTimeSlots(turf.openingTime, turf.closingTime);

        // --- Refined Date Range Calculation ---
        // Ensure 'weekOf' is treated as the start of the day in UTC for consistency
        const startDate = new Date(weekOf + 'T00:00:00Z');
        const endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 7); // Use UTC date methods
        // ---

        // Fetch bookings within the UTC date range
        const bookings = await Booking.find({
            turf: turfId,
            startTime: { $gte: startDate, $lt: endDate },
        });

        // Store booked start times as UTC ISO strings in the Set
        const bookedSlotsSet = new Set(bookings.map(b => {
            // Ensure we are using the Date object directly from DB (which Mongoose hydrates)
            if (b.startTime instanceof Date) {
                return b.startTime.toISOString();
            }
            // Fallback just in case, though Mongoose should handle this
            return new Date(b.startTime).toISOString();
        }));


        const availabilityData = {};
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            // Increment day using UTC methods
            currentDate.setUTCDate(startDate.getUTCDate() + i);
            const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

            availabilityData[dateString] = turfTimeSlots.map(time => {
                const [hour, minute] = time.split(':');

                // --- Consistent Slot Time Calculation in UTC ---
                // Create the potential slot time directly in UTC
                const slotDateTime = new Date(Date.UTC(
                    currentDate.getUTCFullYear(),
                    currentDate.getUTCMonth(),
                    currentDate.getUTCDate(),
                    parseInt(hour, 10),
                    parseInt(minute, 10),
                    0, 0
                ));
                // ---

                // Check if this exact UTC ISO string exists in the set of booked slots
                const isBooked = bookedSlotsSet.has(slotDateTime.toISOString());

                return { time: time, isAvailable: !isBooked };
            });
        }

        res.status(200).json(availabilityData);

    } catch (error) {
        console.error("Error fetching weekly availability:", error);
        res.status(500).json({ message: "Server error while fetching availability." });
    }
});

/**
 * @route   POST /api/bookings/bulk
 * @desc    Create multiple new bookings (Timezone Corrected)
 * @access  Private
 */
router.post('/bulk', protect, async (req, res) => {
    const { turfId, slots, pricePerSlot } = req.body; // slots are like ["2025-10-18T09:00:00", ...]
    if (!slots || slots.length === 0) {
        return res.status(400).json({ message: 'No slots provided.' });
    }

    try {
        // Convert incoming slot strings to UTC Date objects
        const requestedStartTimes = slots.map(slot => new Date(slot + 'Z')); // Add Z for UTC

        // Final check against the database using UTC dates
        const existingBookings = await Booking.find({
            turf: turfId,
            startTime: { $in: requestedStartTimes }
        });

        if (existingBookings.length > 0) {
            return res.status(409).json({
                message: 'Booking failed. One or more of the selected time slots are no longer available. Please refresh and try again.'
            });
        }

        // Create bookings using UTC dates
        const bookingPromises = requestedStartTimes.map(startTime => {
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
            const newBooking = new Booking({
                user: req.user.id,
                turf: turfId,
                startTime, // Already a UTC Date object
                endTime,
                price: pricePerSlot,
                status: 'Confirmed',
            });
            return newBooking.save();
        });

        await Promise.all(bookingPromises);

        res.status(201).json({
            message: 'Bookings successful!',
            count: requestedStartTimes.length,
        });

    } catch (error) {
        console.error('Bulk booking error:', error);
        res.status(500).json({ message: 'Failed to create bookings due to a server error.' });
    }
});

/**
 * @route   GET /api/bookings/user
 * @desc    Get all bookings for the currently logged-in user
 * @access  Private
 */
router.get('/user', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('turf', 'name address images')
            .sort({ startTime: -1 });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;