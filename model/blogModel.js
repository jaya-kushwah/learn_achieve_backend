const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  category: { type: String, required: true },
  authorName: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  featuredImage: { type: String, required: true },
  mainImage: { type: String, required: true },
  briefIntro: { type: String },
  details: { type: String }
}, { timestamps: true });

// ✨ Remove timestamps from API response
blogSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Blog', blogSchema);
