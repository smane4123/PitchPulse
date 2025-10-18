// PITCHPULSE/backend/models/Turf.js

const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sport: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    },
    openingTime: {
        type: String, // e.g., "06:00"
        required: true,
        default: '06:00'
    },
    closingTime: {
        type: String, // e.g., "23:00"
        required: true,
        default: '23:00'
    },
    // --- ADDED: Fields for Reviews ---
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        // Optional: Use setter to ensure rounding if needed during direct sets
        // set: val => Math.round(val * 10) / 10 // Rounds to one decimal place
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }
    // ---------------------------------
}, { timestamps: true });

// --- ADDED: Static method to calculate average rating ---
turfSchema.statics.calculateAverageRating = async function(turfId) {
    // Need to access the Review model - ensure it's registered before calling this
    const Review = mongoose.model('Review'); // Access Review model this way

    const stats = await Review.aggregate([
        {
            $match: { turf: turfId } // Match reviews for the specific turf
        },
        {
            $group: {
                _id: '$turf', // Group by turf ID
                numReviews: { $sum: 1 }, // Count the number of reviews
                avgRating: { $avg: '$rating' } // Calculate the average rating
            }
        }
    ]);

    try {
        if (stats.length > 0) {
            // If there are reviews, update the turf document
            await this.findByIdAndUpdate(turfId, {
                numberOfReviews: stats[0].numReviews,
                // Round average rating to one decimal place
                averageRating: parseFloat(stats[0].avgRating.toFixed(1))
            });
        } else {
            // If no reviews found (e.g., last review deleted), reset fields
            await this.findByIdAndUpdate(turfId, {
                numberOfReviews: 0,
                averageRating: 0
            });
        }
    } catch (err) {
        console.error(`Error updating average rating for turf ${turfId}:`, err);
    }
};

// --- IMPORTANT NOTE ---
// The actual *trigger* for calling `calculateAverageRating` will be
// placed as a 'post save' and 'post remove' hook within the
// `Review.js` model file (which we created earlier).


const Turf = mongoose.model('Turf', turfSchema);
module.exports = Turf;