import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // We reuse our login gatekeeper
import Message from '../models/Message.js'; // Import our new model

const router = express.Router();

// @route   POST /api/contact/submit
// @desc    Submit a contact form message
// @access  Private (user must be logged in)
router.post('/submit', protect, async (req, res) => {
    const { subject, message } = req.body;
    
    // Basic validation
    if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required.' });
    }

    try {
        // The 'protect' middleware gives us the logged-in user in 'req.user'
        const newMessage = new Message({
            user: req.user.id,
            userName: `${req.user.firstName} ${req.user.lastName}`,
            userEmail: req.user.email,
            subject: subject,
            message: message
        });

        await newMessage.save();

        res.status(201).json({ message: 'Thank you for your message! We will get back to you shortly.' });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({ message: 'Sorry, there was an error sending your message. Please try again later.' });
    }
});

export default router;