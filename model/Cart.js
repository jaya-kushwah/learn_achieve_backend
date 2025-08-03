const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  packages: [
    {
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });


module.exports = mongoose.model('Cart', cartSchema);
