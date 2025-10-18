// PITCHPULSE/backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf'); // Import Turf model
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/reviews
 * @desc    Create a new review for a completed booking
 * @access  Private (Player only)
 */
router.post('/', protect, async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!bookingId || !rating) {
        return res.status(400).json({ message: 'Booking ID and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
         return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: 'You can only review your own bookings.' });
        }
        // Optional: Check if booking end time is in the past
        // if (new Date(booking.endTime) > new Date()) {
        //     return res.status(400).json({ message: 'Cannot review a future booking.' });
        // }
        if (booking.hasBeenReviewed) {
            return res.status(400).json({ message: 'This booking has already been reviewed.' });
        }

        // Check again if review exists (database constraint might catch this too)
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already submitted.' });
        }

        const newReview = await Review.create({
            turf: booking.turf,
            user: userId,
            booking: bookingId,
            rating,
            comment
        });

        // Mark booking as reviewed AFTER review creation succeeds
        await Booking.findByIdAndUpdate(bookingId, { hasBeenReviewed: true });

        // Note: Recalculation is handled by the 'post save' hook in Review.js model now

        res.status(201).json({ message: 'Review submitted successfully!', review: newReview });

    } catch (error) {
        console.error('Error submitting review:', error);
         // Handle unique index error explicitly
        if (error.code === 11000 && error.keyPattern && error.keyPattern.booking) {
             return res.status(400).json({ message: 'Review already submitted for this booking.' });
        }
        res.status(500).json({ message: 'Server error while submitting review.' });
    }
});

/**
 * @route   GET /api/reviews/turf/:turfId
 * @desc    Get all reviews for a specific turf
 * @access  Public
 */
router.get('/turf/:turfId', async (req, res) => {
    try {
        const reviews = await Review.find({ turf: req.params.turfId })
            .populate('user', 'email') // Adjust fields as needed (e.g., 'name' if you add it to User model)
            .sort({ createdAt: -1 }); // Show newest first

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
});

module.exports = router;