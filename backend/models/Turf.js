// PITCHPULSE/backend/models/Turf.js
const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
    // Owner reference
    owner: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    contact: { type: String },

    // Sport type
    sport: { 
        type: String, 
        required: true,
        enum: ['Football', 'Cricket', 'Badminton', 'Basketball', 'Tennis', 'Mixed'],
    },
    
    pricePerHour: { type: Number, required: true },
    amenities: [String],

    // Multiple images (Multer upload paths)
    images: { 
        type: [String],
        default: [],
    },
    
    // ✅ FIXED: location is now required only if you want maps support
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: undefined, // <-- prevents empty []
        },
    },

    description: { type: String },
}, { timestamps: true });

// ✅ Create geospatial index
TurfSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Turf', TurfSchema);
