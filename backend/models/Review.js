// PITCHPULSE/backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    turf: { // Link to the turf being reviewed
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Turf'
    },
    user: { // Link to the user who wrote the review
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    booking: { // Link to the specific booking this review is for
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Booking',
        unique: true // Ensure only one review per booking
    },
    rating: { // The star rating (e.g., 1 to 5)
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: { // The optional text review
        type: String,
        trim: true,
        maxlength: 500 // Limit comment length
    }
}, { timestamps: true }); // Adds createdAt

// Optional: Index for faster querying of reviews by turf
reviewSchema.index({ turf: 1 });

// --- IMPORTANT: Trigger rating recalculation on the Turf model ---
// This assumes you have the `calculateAverageRating` static method on your Turf model
reviewSchema.post('save', async function() {
    // `this.constructor` refers to the Review model
    // `this.turf` refers to the turf ID saved in this review document
    await this.constructor.model('Turf').calculateAverageRating(this.turf);
});

// Also trigger recalculation if a review is removed (less common, but good practice)
reviewSchema.post('remove', async function() {
     await this.constructor.model('Turf').calculateAverageRating(this.turf);
});


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;