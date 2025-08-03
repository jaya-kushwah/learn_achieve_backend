const Subject = require('../model/subjectModel');
const fs = require('fs');
const path = require('path');

const subjectService = {
  addOrUpdateSubject: async ({ id, subject, classId, color, image }) => {
    if (id) {
      const existing = await Subject.findById(id);
      if (!existing) throw new Error('Subject not found');

      const duplicate = await Subject.findOne({
        _id: { $ne: id },
        subject,
        class: classId
      });
      if (duplicate) throw new Error('This subject already exists for the selected class');

      existing.subject = subject;
      existing.class = classId || existing.class;
      existing.color = color || existing.color;
      existing.image = image || existing.image;

      await existing.save();
      return existing;
    } else {
      const duplicate = await Subject.findOne({ subject, class: classId });
      if (duplicate) throw new Error('This subject already exists for the selected class');

      const newSubject = new Subject({
        subject,
        class: classId,
        color,
        image
      });
      await newSubject.save();
      return newSubject;
    }
  },

  getFilteredSubjects: async (search, limit, offset) => {
    const filter = search
      ? { subject: { $regex: search.trim(), $options: 'i' } }
      : {};

    const total = await Subject.countDocuments(filter);
    const subjects = await Subject.find(filter)
      .skip(offset)
      .limit(limit)
      .populate('class')
      .sort({ createdAt: -1 });

    return {
      total,
      count: subjects.length,
      subjects,
      nextOffset: offset + limit < total ? offset + limit : null,
      prevOffset: offset - limit >= 0 ? offset - limit : null,
    };
  },

  deleteSubject: async (id) => {
    const subject = await Subject.findById(id);
    if (!subject) throw new Error('Subject not found');

    if (subject.image) {
      const imagePath = path.resolve(subject.image);
      fs.unlink(imagePath, err => {
        if (err) console.error('Image delete error:', err.message);
      });
    }

    await Subject.findByIdAndDelete(id);
  },

  deleteMultiple: async (ids) => {
    const subjects = await Subject.find({ _id: { $in: ids } });

    for (const subject of subjects) {
      if (subject.image) {
        const imagePath = path.resolve(subject.image);
        fs.unlink(imagePath, err => {
          if (err) console.error('Failed to delete image:', err);
        });
      }
    }

    await Subject.deleteMany({ _id: { $in: ids } });
  },
updateStatus: async (id, status) => {
  if (!['active', 'inactive'].includes(status)) {
    throw new Error('Invalid status');
  }

  const subject = await Subject.findById(id);
  if (!subject) throw new Error('Subject not found');

  if (subject.status === status) {
    throw new Error(`Subject is already ${status}`);
  }

  subject.status = status;
  await subject.save();

  return subject;
},

  getSubjectsByClass: async (classId) => {
    return await Subject.find({ class: classId }).populate('class').sort({ createdAt: -1 });
  },
};

module.exports = subjectService;
