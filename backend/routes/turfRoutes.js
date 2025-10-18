// PITCHPULSE/backend/routes/turfRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const Turf = require('../models/Turf');
const { protect } = require('../middleware/authMiddleware');

// Multer Configuration for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

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

// --- THIS IS THE NEWLY ADDED ROUTE THAT FIXES YOUR ERROR ---
/**
 * @route   GET /api/turfs/owner/:ownerId
 * @desc    Get all turfs for a specific owner
 * @access  Private
 */
router.get('/owner/:ownerId', protect, async (req, res) => {
    // Authorization: Ensure the logged-in user is requesting their own turfs
    if (req.user.id !== req.params.ownerId) {
        return res.status(403).json({ message: 'Not authorized to view these turfs.' });
    }
    try {
        const turfs = await Turf.find({ owner: req.params.ownerId }).sort({ createdAt: -1 });
        res.status(200).json(turfs);
    } catch (error) {
        console.error("Error fetching owner's turfs:", error);
        res.status(500).json({ message: 'Server error while fetching owner turfs' });
    }
});
// --- END OF NEW ROUTE ---

/**
 * @route   GET /api/turfs/:id
 * @desc    Get a single turf by its ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        // IMPORTANT: This route must come *after* specific routes like '/owner/:ownerId'
        // or Express will think 'owner' is an ID.
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }
        res.json(turf);
    } catch (error) {
        console.error("Error fetching turf by ID:", error);
        res.status(400).json({ message: 'Invalid Turf ID format or server error' });
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

        if (req.files && req.files.length > 0) {
            turfData.images = req.files.map(file => `/uploads/${file.filename}`);
        }

        const updatedTurf = await Turf.findByIdAndUpdate(
            req.params.id,
            { $set: turfData },
            { new: true }
        );
        res.json(updatedTurf);
    } catch (error) {
        console.error('Error updating turf:', error);
        res.status(400).json({ message: 'Error updating turf', details: error.message });
    }
});

module.exports = router;