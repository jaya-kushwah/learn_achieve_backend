const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  packageName: {
    type: [String],
    required: true
  },
  medium: {
    type: String,
    enum: ['Hindi', 'English'],
    required: true
  },
   className: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'ClassMaster',
  required: true
},

  image: {
    type: String,
    required: true
  },
  mockTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',
    required: true
  }],
  numberOfAttempts: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    enum: ['Bharat Sat', 'Pradanya Learnatics'],
    required: true
  },
  actualPrice: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v < this.actualPrice;
      },
      message: 'Discount price must be less than actual price'
    }
  },
  finalPrice: {
    type: Number // removed validator here
  },
  validityInDays: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate and validate finalPrice
packageSchema.pre('save', function (next) {
  if (this.discountPrice >= this.actualPrice) {
    return next(new Error('Discount price must be less than actual price'));
  }

  this.finalPrice = this.actualPrice - this.discountPrice;
  next();
});
const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
