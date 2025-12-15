import express from 'express';
import Razorpay from 'razorpay';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import crypto from 'crypto';

// THIS IS THE MISSING PART: You must create the router before you can use it
const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const planDetails = {
    'basic': { amount: 1000, name: 'Basic Plan' },
    'advanced': { amount: 1800, name: 'Advanced Plan' },
    'pro': { amount: 3000, name: 'Pro Plan' }
};

// ROUTE 1: Create a new Razorpay order
router.post('/create-order', protect, async (req, res) => {
    const { plan } = req.body;
    const planInfo = planDetails[plan];

    if (!planInfo) {
        return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const options = {
        amount: planInfo.amount,
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json({
            key_id: process.env.RAZORPAY_KEY_ID,
            order: order,
            user: {
                name: `${req.user.firstName} ${req.user.lastName}`,
                email: req.user.email
            }
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Error creating Razorpay order' });
    }
});

// ROUTE 2: Verify the payment and save the order to the database
router.post('/verify-payment', protect, async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        planName,
        amount 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    try {
        // Step 1: Verify the signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
        }

        // Step 2: Save the verified order to the database
        const newOrder = new Order({
            user: req.user.id,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userEmail: req.user.email,
            planName: planName,
            amount: amount,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            status: 'paid'
        });

        await newOrder.save();

        res.status(200).json({ 
            message: 'Payment Successful and Verified. Your order has been saved.',
            orderId: newOrder._id
        });

    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// THIS LINE MUST BE AT THE END
export default router;