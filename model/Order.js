const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packages: [
    {
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      },
      priceAtOrder: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  orderedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Delivered'],
    default: 'Confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
