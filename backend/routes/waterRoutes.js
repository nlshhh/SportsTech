import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import WaterEntry from '../models/WaterEntry.js';

const router = express.Router();

// === GET USER'S WATER HISTORY ===
// @route   GET /api/water/history
// @access  Private (requires login)
router.get('/history', protect, async (req, res) => {
  try {
    // req.user.id comes from the 'protect' middleware
    const history = await WaterEntry.find({ user: req.user.id }).sort({ date: -1 }); // Sort newest first
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

// === ADD OR UPDATE TODAY'S WATER INTAKE ===
// @route   POST /api/water/update
// @access  Private
router.post('/update', protect, async (req, res) => {
  const { date, goal, intakeAmount } = req.body;

  try {
    // Find an entry for this user and this date
    let entry = await WaterEntry.findOne({ user: req.user.id, date: date });

    if (entry) {
      // If an entry for today exists, UPDATE it
      entry.totalIntake += intakeAmount;
      entry.goal = goal; // Update goal in case it changed
      entry.completed = entry.totalIntake >= entry.goal;
    } else {
      // If no entry exists, CREATE a new one
      entry = new WaterEntry({
        user: req.user.id,
        date: date,
        goal: goal,
        totalIntake: intakeAmount,
        completed: intakeAmount >= goal
      });
    }

    const savedEntry = await entry.save();
    res.status(200).json(savedEntry); // Send back the updated/new data

  } catch (error) {
    res.status(500).json({ message: "Error saving entry" });
  }
});

export default router;