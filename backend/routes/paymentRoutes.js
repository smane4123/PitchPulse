// PITCHPULSE/backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const razorpayInstance = require('../utils/razorpay');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have this
const Booking = require('../models/Booking');
const crypto = require('crypto'); // Built-in Node.js module

/**
 * @route   GET /api/payment/get-key
 * @desc    Get Razorpay Key ID
 * @access  Private
 */
router.get('/get-key', protect, (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

/**
 * @route   POST /api/payment/create-order
 * @desc    Create a Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, async (req, res) => {
    const { turfId, startTime, endTime, price } = req.body;

    if (!turfId || !startTime || !endTime || !price) {
        return res.status(400).json({ message: 'Missing required booking details' });
    }

    // 1. Check if the slot is still available
    const existingBooking = await Booking.findOne({
        turf: turfId,
        status: 'Confirmed',
        $or: [
            { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
        ]
    });

    if (existingBooking) {
        return res.status(409).json({ message: 'Sorry, this time slot is no longer available.' });
    }

    // 2. Create Razorpay order
    const options = {
        amount: Number(price) * 100,  // Razorpay requires amount in smallest currency unit (paise)
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { // Store all info we need to create the booking
            turfId,
            userId: req.user.id,
            startTime,
            endTime,
            price
        }
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        res.status(201).json({ order });
    } catch (err) {
        console.error("Razorpay Create Order Error:", err);
        res.status(500).json({ message: 'Failed to create Razorpay order' });
    }
});


/**
 * @route   POST /api/payment/verify-payment
 * @desc    Verify Razorpay payment and create booking
 * @access  Private
 */
router.post('/verify-payment', protect, async (req, res) => {
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    } = req.body;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
         return res.status(400).json({ message: 'Payment verification data missing' });
    }

    // 1. Verify the signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    // 2. Signature is valid, fetch order details to get notes
    try {
        const order = await razorpayInstance.orders.fetch(razorpay_order_id);
        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

        if (!order || !payment) {
             return res.status(404).json({ message: 'Order or Payment not found' });
        }
        
        const { turfId, userId, startTime, endTime, price } = order.notes;

        // 3. Create the Booking in our database
        const newBooking = new Booking({
            user: userId,
            turf: turfId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            price: parseFloat(price),
            status: 'Confirmed', // Payment is confirmed
            paymentId: razorpay_payment_id, // Use Razorpay's ID
            paymentStatus: 'Completed',
            payerEmail: payment.email,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            hasBeenReviewed: false
        });
        
        await newBooking.save();

        res.status(201).json({ 
            message: 'Booking successful!',
            booking: newBooking 
        });

    } catch (err) {
        console.error("Razorpay Verify Error:", err);
        res.status(500).json({ message: 'Payment verification failed' });
    }
});

module.exports = router;