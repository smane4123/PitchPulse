// PITCHPULSE/backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    // Role can be 'player' or 'owner'
    role: {
        type: String,
        enum: ['player', 'owner'],
        default: 'player',
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
