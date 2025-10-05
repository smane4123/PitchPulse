// PITCHPULSE/backend/routes/turfRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer'); // <--- 1. Import Multer
const Turf = require('../models/Turf');
const { protect } = require('../middleware/authMiddleware'); // Assuming protect is working

// ----------------------------------------------------
// Multer Configuration for Image Uploads
// ----------------------------------------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Multer saves files to the 'uploads/' folder in your backend root
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Naming files uniquely
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configure upload middleware
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});


// @route   POST /api/turfs (Add a new turf)
// @access  Private/Owner
router.post(
    '/', 
    protect, 
    upload.array('images', 5), // <--- 2. Multer processes files here
    async (req, res) => {
        
        if (req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Not authorized. Owner role required.' });
        }

        let turfData;
        
        // 3. Handle the JSON data and files from the FormData object
        try {
            // The frontend sends turf details as a JSON string under the key 'turfData'
            if (req.body.turfData) {
                turfData = JSON.parse(req.body.turfData);
            } else {
                // If turfData field is missing, fallback to req.body (less likely with file uploads)
                turfData = req.body;
            }
        } catch (error) {
            // If the JSON parsing fails, the submission is invalid
            return res.status(400).json({ message: "Invalid turfData JSON format." });
        }
        
        // 4. Extract paths of uploaded images
        // Multer saves these paths to req.files
        const imagePaths = req.files ? req.files.map(file => file.path) : [];
        
        try {
            // 5. Mongoose Logic: Create turf with parsed data and image paths
            // Ensure your Turf model uses 'owner' and requires 'sport'
            const newTurf = await Turf.create({
                ...turfData,
                owner: req.user.id, // Linking the turf to the authenticated owner
                images: imagePaths, // <--- SAVING THE IMAGE PATHS
            });

            res.status(201).json(newTurf);
        } catch (error) {
            console.error('Error adding turf:', error);
            // This error is likely due to Mongoose validation (missing required fields like name, location, or sport)
            res.status(400).json({ 
                message: 'Invalid turf data or missing required fields', 
                details: error.message 
            });
        }
    }
);

// @route   GET /api/turfs (Get all turfs for homepage)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const turfs = await Turf.find().sort({ createdAt: -1 });
        res.json(turfs);
    } catch (error) {
        console.error('Error fetching turfs:', error);
        res.status(500).json({ message: 'Server error while fetching turfs' });
    }
});

// @route   GET /api/turfs/owner/:ownerId (Get turfs by owner for Dashboard)
// @access  Private/Owner
router.get('/owner/:ownerId', protect, async (req, res) => {
    // Security check: ensure the authenticated user is viewing their own turfs
    if (req.user.id !== req.params.ownerId) {
        return res.status(403).json({ message: 'Not authorized to view other owners turfs' });
    }

    try {
        // Find turfs where the 'owner' field matches the authenticated user ID
        const turfs = await Turf.find({ owner: req.params.ownerId }); 
        res.json(turfs);
    } catch (error) {
        console.error('Error fetching owner turfs:', error);
        res.status(500).json({ message: 'Server error while fetching owner turfs' });
    }
});

// @route   GET /api/turfs/:id (Get single turf)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const turf = await Turf.findById(req.params.id);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }
        res.json(turf);
    } catch (error) {
        console.error('Error fetching turf:', error);
        res.status(400).json({ message: 'Invalid Turf ID format' });
    }
});

module.exports = router;