// PITCHPULSE/backend/models/Booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    turf: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Turf'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Confirmed', 'Cancelled'],
        default: 'Confirmed'
    },
    // --- ADDED ---
    hasBeenReviewed: {
        type: Boolean,
        default: false
    }
    // -------------
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;