const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  packages: [
    {
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
      },
      quantity: {
        type: Number,
        default: 1
      },
      priceAtOrder: Number, // Final price paid
      discountAtOrder: {
        type: Number,
        default: 0
      },
      originalPrice: Number // Actual original price before discount
    }
  ],
  totalAmount: Number,
  discountAmt: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Confirmed'
  },
  orderedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);