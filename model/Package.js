const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    packageName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
      enum: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], 
    },
    medium: {
      type: String,
      required: true,
      enum: ['Hindi', 'English'],
    },
  mockTests: {
  type: [String], 
  enum: ['Maths', 'Science', 'English', 'History', 'Geography'], 
  required: true,
},

   numberOfAttempts: {
  type: Number,
  required: true,
  min: [1, 'At least 1 attempt is required'],
  max: [3, 'Number of attempts cannot exceed 3'],
},

    platform: {
      type: String,
      required: true,
      enum: ['Bharat-Sat', 'ExamYa'],
    },
    actualPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    validityInDays: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: '',
    },
      isActive: {
     type: Boolean, 
     default: true }
  },
  {
    timestamps: true,
  }
);

// calculate finalPrice before saving
packageSchema.pre('save', function (next) {
  this.finalPrice = this.actualPrice - this.discountPrice;
  next();
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
