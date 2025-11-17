import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // --- ADD THESE TWO NEW FIELDS ---
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },

  planName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;