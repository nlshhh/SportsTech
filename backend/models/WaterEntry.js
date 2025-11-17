import mongoose from 'mongoose';

const waterEntrySchema = new mongoose.Schema({
  date: { 
    type: String, 
    required: true 
  },
  goal: { 
    type: Number, 
    required: true 
  },
  totalIntake: { 
    type: Number, 
    required: true 
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  // This is the CRITICAL link to the user who owns this data
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This refers to your 'User' model
    required: true
  }
});

// Create a compound index to ensure one entry per user per day
waterEntrySchema.index({ user: 1, date: 1 }, { unique: true });

const WaterEntry = mongoose.model('WaterEntry', waterEntrySchema);

export default WaterEntry;