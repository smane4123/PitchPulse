// PITCHPULSE/backend/routes/bookingRoutes.js

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Ensure this path is correct
const Turf = require('../models/Turf');      // Ensure this path is correct
const { protect } = require('../middleware/authMiddleware'); // Ensure this path is correct

// --- Helper Functions ---
const generateTimeSlots = (start = '06:00', end = '23:00') => {
    const slots = [];
    let currentHour = parseInt(start.split(':')[0], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    while (currentHour < endHour) {
        slots.push(`${String(currentHour).padStart(2, '0')}:00`);
        currentHour++;
    }
    return slots;
};

// Define standard time slots used by the single-day availability check
const STANDARD_TIME_SLOTS = [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
];

// --- ROUTES ---

// ==========================================================
// == NEW Route for Single-Day Availability (for BookingPage) ==
// ==========================================================
/**
 * @route   GET /api/bookings/availability
 * @desc    Get available time slots for a specific turf and SINGLE date
 * @access  Public
 */
router.get('/availability', async (req, res) => {
    const { turfId, date } = req.query; // date is 'YYYY-MM-DD'

    if (!turfId || !date) {
        return res.status(400).json({ message: 'Turf ID and date are required.' });
    }

    try {
        const startOfDay = new Date(date + 'T00:00:00Z');
        const endOfDay = new Date(date + 'T23:59:59Z');

        const existingBookings = await Booking.find({
            turf: turfId,
            date: { $gte: startOfDay, $lte: endOfDay } // Compare the 'date' field
        });

        const bookedSlots = new Set(existingBookings.map(booking => booking.startTime)); // Set of time strings like "10:00 AM"

        // Use STANDARD_TIME_SLOTS defined above
        const availableSlots = STANDARD_TIME_SLOTS.map(slot => ({
            time: slot,
            isAvailable: !bookedSlots.has(slot)
        }));

        res.json(availableSlots);

    } catch (error) {
        console.error('Error fetching single-day availability:', error);
        res.status(500).json({ message: 'Server error fetching availability.' });
    }
});

// ==========================================================
// == ORIGINAL Route for Weekly Availability ==
// ==========================================================
/**
 * @route   GET /api/bookings/availability/week
 * @desc    Get availability for a specific turf for a whole week
 * @access  Public
 */
router.get('/availability/week', async (req, res) => {
    try {
        const { turfId, weekOf } = req.query; // weekOf is YYYY-MM-DD
        if (!turfId || !weekOf) {
            return res.status(400).json({ message: "Turf ID and week start date are required." });
        }

        const turf = await Turf.findById(turfId);
        if (!turf) {
            return res.status(404).json({ message: "Turf not found." });
        }

        const turfTimeSlots = generateTimeSlots(turf.openingTime, turf.closingTime); // Uses helper

        const startDate = new Date(weekOf + 'T00:00:00Z');
        const endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 7);

        // Fetch bookings within the UTC date range for the entire week
        // **IMPORTANT**: This assumes your Booking model stores `startTime` as a full Date object
        const bookings = await Booking.find({
            turf: turfId,
            startTime: { $gte: startDate, $lt: endDate }, // Query based on startTime Date object
        });

        // Store booked start times as UTC ISO strings in the Set
        const bookedSlotsSet = new Set(bookings.map(b => b.startTime.toISOString()));

        const availabilityData = {};
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setUTCDate(startDate.getUTCDate() + i);
            const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

            availabilityData[dateString] = turfTimeSlots.map(time => {
                const [hour, minute] = time.split(':');
                // Create the potential slot time in UTC for comparison
                const slotDateTime = new Date(Date.UTC(
                    currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(),
                    parseInt(hour, 10), parseInt(minute, 10), 0, 0
                ));
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


// ==========================================================
// == NEW Route for Creating a SINGLE Booking (after Payment) ==
// ==========================================================
/**
 * @route   POST /api/bookings
 * @desc    Create a new SINGLE booking
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    const { turfId, startTime, date, price, duration = 1 } = req.body;

    if (!turfId || !startTime || !date || price === undefined) {
        return res.status(400).json({ message: 'Missing required booking information.' });
    }

    try {
        const startOfDay = new Date(date + 'T00:00:00Z');
        const endOfDay = new Date(date + 'T23:59:59Z');

        const existingBooking = await Booking.findOne({
            turf: turfId,
            date: { $gte: startOfDay, $lte: endOfDay },
            startTime: startTime // Check based on the time string (e.g., "10:00 AM")
        });

        if (existingBooking) {
            return res.status(409).json({ message: 'This time slot was just booked. Please select another time.' });
        }

        const newBooking = new Booking({
            user: req.user.id,
            turf: turfId,
            startTime: startTime, // Store the time string
            date: startOfDay,    // Store the date (start of day UTC)
            price: price,
            duration: duration,
            status: 'Confirmed'
        });

        const savedBooking = await newBooking.save();
        await savedBooking.populate({ path: 'turf', select: 'name address' });

        res.status(201).json({ message: 'Booking created successfully!', booking: savedBooking });

    } catch (error) {
        console.error('Error creating single booking:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid booking data.', details: error.message });
        }
        res.status(500).json({ message: 'Booking creation failed due to server error.' });
    }
});


// ==========================================================
// == ORIGINAL Route for Bulk Booking ==
// ==========================================================
/**
 * @route   POST /api/bookings/bulk
 * @desc    Create multiple new bookings
 * @access  Private
 */
router.post('/bulk', protect, async (req, res) => {
    const { turfId, slots, pricePerSlot } = req.body; // slots are like ["2025-10-18T09:00:00", ...]
    if (!slots || slots.length === 0) {
        return res.status(400).json({ message: 'No slots provided.' });
    }

    try {
        // **IMPORTANT**: This assumes your Booking model stores `startTime` as a full Date object
        const requestedStartTimes = slots.map(slot => new Date(slot + 'Z')); // Convert to UTC Date objects

        // Final check against the database using UTC dates
        const existingBookings = await Booking.find({
            turf: turfId,
            startTime: { $in: requestedStartTimes } // Check if any startTime matches
        });

        if (existingBookings.length > 0) {
            return res.status(409).json({
                message: 'Booking failed. One or more selected time slots are no longer available.'
            });
        }

        // Create bookings using UTC dates
        const bookingPromises = requestedStartTimes.map(startTime => {
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assuming 1 hour slots
            const newBooking = new Booking({
                user: req.user.id,
                turf: turfId,
                startTime, // Store as Date object
                endTime,   // Store as Date object
                // **NOTE**: Your Booking model needs 'date' field if you store startTime as Date
                // date: new Date(startTime.getUTCFullYear(), startTime.getUTCMonth(), startTime.getUTCDate()), // Extract date part if needed
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


// ==========================================================
// == ORIGINAL Route for User Bookings ==
// ==========================================================
/**
 * @route   GET /api/bookings/user
 * @desc    Get all bookings for the currently logged-in user
 * @access  Private
 */
router.get('/user', protect, async (req, res) => {
    try {
        // Find bookings and sort based on whether startTime is a Date or date is used
        const bookings = await Booking.find({ user: req.user.id })
            .populate('turf', 'name address images')
            // Adjust sort based on your Booking model schema:
            .sort({ date: -1, startTime: 1 }); // Assumes you have a 'date' field and 'startTime' is a string like "10:00 AM"
            // .sort({ startTime: -1 }); // Use this if 'startTime' is a full Date object and you don't have a separate 'date' field
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error fetching your bookings.' });
    }
});

module.exports = router;