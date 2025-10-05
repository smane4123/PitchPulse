// PITCHPULSE/backend/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    turfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Turf',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // ✅ Store both date and time separately
    date: {
        type: Date, 
        required: true,
    },
    startTime: {
        type: String, // e.g. "10:00"
        required: true,
    },
    duration: {
        type: Number, // in hours
        required: true,
    },

    totalPrice: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'], // ✅ added "pending" for flexibility
        default: 'confirmed',
    }
}, { timestamps: true });

// ✅ Populate turf name & user automatically when fetching
BookingSchema.pre(/^find/, function(next) {
    this.populate('turfId', 'name sport address location')
        .populate('userId', 'email');
    next();
});

module.exports = mongoose.model('Booking', BookingSchema);
