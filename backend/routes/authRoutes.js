import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// === REGISTER A NEW USER ===
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // 1. Check if user with that email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 2. Create a new user instance
    user = new User({ firstName, lastName, email, password });

    // 3. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Save the user to the database
    await user.save();

    // 5. Send a success response
    res.status(201).json({ message: 'Account created successfully! Please log in.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});


// === LOGIN A USER ===
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. If credentials are correct, create a JSON Web Token (JWT)
    const payload = {
      user: {
        id: user.id // This is the user's unique ID from MongoDB
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key
      { expiresIn: '1h' },    // Token will be valid for 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Send the token back to the client
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;