const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  image: { type: String, required: true },
  color: { type: String, default: '#000000' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassMaster',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
