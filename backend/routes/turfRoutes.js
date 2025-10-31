// PITCHPULSE/backend/routes/turfRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Turf = require('../models/Turf');
const Booking = require('../models/Booking'); // Import Booking model
const Review = require('../models/Review');   // Import Review model
const { protect } = require('../middleware/authMiddleware');
// const fs = require('fs'); // Optional: For deleting images
// const path = require('path'); // Optional: For deleting images

// Multer Configuration (keep as is)
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 } });

// --- ROUTES ---

/**
 * @route   GET /api/turfs
 * @desc    Get all turfs for the homepage
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const turfs = await Turf.find({}).sort({ createdAt: -1 });
        res.status(200).json(turfs);
    } catch (error) {
        console.error("Error fetching all turfs:", error);
        res.status(500).json({ message: 'Server error while fetching turfs' });
    }
});

/**
 * @route   GET /api/turfs/owner/:ownerId
 * @desc    Get all turfs for a specific owner
 * @access  Private
 */
router.get('/owner/:ownerId', protect, async (req, res) => {
    if (req.user.id !== req.params.ownerId) {
        return res.status(403).json({ message: 'Not authorized.' });
    }
    try {
        const turfs = await Turf.find({ owner: req.params.ownerId }).sort({ createdAt: -1 });
        res.status(200).json(turfs);
    } catch (error) {
        console.error("Error fetching owner's turfs:", error);
        res.status(500).json({ message: 'Server error fetching owner turfs' });
    }
});

/**
 * @route   GET /api/turfs/:id
 * @desc    Get a single turf by its ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }
        res.json(turf);
    } catch (error) {
        console.error("Error fetching turf by ID:", error);
        // Distinguish between invalid ID format and not found
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Turf ID format' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/turfs
 * @desc    Add a new turf
 * @access  Private (Owner only)
 */
router.post('/', protect, upload.array('images', 5), async (req, res) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Not authorized. Owner role required.' });
    }
    try {
        const turfData = JSON.parse(req.body.turfData);
        const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const newTurf = await Turf.create({
            ...turfData,
            owner: req.user.id,
            images: imagePaths,
        });
        res.status(201).json(newTurf);
    } catch (error) {
        console.error('Error adding turf:', error);
        res.status(400).json({ message: 'Invalid turf data', details: error.message });
    }
});

/**
 * @route   PUT /api/turfs/:id
 * @desc    Update an existing turf
 * @access  Private (Owner only)
 */
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Not authorized.' });
    }
    try {
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found.' });
        }
        if (turf.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to edit this turf.' });
        }

        const turfData = JSON.parse(req.body.turfData);

        // Handle new image uploads (replace old ones if needed, or append)
        // This example replaces existing images if new ones are uploaded
        if (req.files && req.files.length > 0) {
             // Optional: Delete old images from 'uploads' folder here if replacing
            turfData.images = req.files.map(file => `/uploads/${file.filename}`);
        } else if (turfData.images === undefined) {
             // If turfData doesn't include images, keep existing ones
             delete turfData.images; // Prevent accidental overwrite with undefined
        }

        const updatedTurf = await Turf.findByIdAndUpdate(
            req.params.id,
            { $set: turfData },
            { new: true, runValidators: true } // Added runValidators
        );
        res.json(updatedTurf);
    } catch (error) {
        console.error('Error updating turf:', error);
        res.status(400).json({ message: 'Error updating turf', details: error.message });
    }
});


// --- ✅ ADDED: DELETE TURF ROUTE ---
/**
 * @route   DELETE /api/turfs/:id
 * @desc    Delete a turf
 * @access  Private (Owner only)
 */
router.delete('/:id', protect, async (req, res) => {
    // 1. Check if user is an owner
    if (req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Not authorized. Owner role required.' });
    }

    try {
        // 2. Find the turf by ID
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found.' });
        }

        // 3. Verify ownership
        if (turf.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this turf.' });
        }

        // --- Optional Cleanup ---
        // a) Delete associated bookings
        // await Booking.deleteMany({ turf: req.params.id });
        // console.log(`Deleted bookings for turf ${req.params.id}`);

        // b) Delete associated reviews
        // await Review.deleteMany({ turf: req.params.id });
        // console.log(`Deleted reviews for turf ${req.params.id}`);

        // c) Delete associated images from filesystem
        // if (turf.images && turf.images.length > 0) {
        //     turf.images.forEach(imagePath => {
        //         const fullPath = path.join(__dirname, '..', imagePath); // Go up one level from routes
        //         fs.unlink(fullPath, (err) => {
        //             if (err) console.error(`Error deleting image ${fullPath}:`, err);
        //             else console.log(`Deleted image ${fullPath}`);
        //         });
        //     });
        // }
        // --- End Optional Cleanup ---

        // 4. Delete the turf document
        await Turf.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Turf deleted successfully.' });

    } catch (error) {
        console.error('Error deleting turf:', error);
        // Handle specific errors like invalid ID format
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Turf ID format' });
        }
        res.status(500).json({ message: 'Server error while deleting turf.' });
    }
});
// --- ✅ END OF DELETE ROUTE ---


module.exports = router;