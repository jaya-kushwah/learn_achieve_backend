const mongoose = require('mongoose');

const classMasterSchema = new mongoose.Schema({
  class: { type: String, required: true, unique: true  },
  classEndDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ClassMaster', classMasterSchema);
