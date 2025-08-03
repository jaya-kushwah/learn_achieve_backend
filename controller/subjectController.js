const mongoose = require("mongoose");
const subjectService = require("../service/subjectService");

const subjectController = {
  // Add or Update Subject
  addOrUpdateSubject: async (req, res) => {
    try {
      const { subject, classId, color, id } = req.body;
      const file = req.file;
      const image = file ? `${req.protocol}://${req.get('host')}/uploads/${file.filename}` : null;

      if (!subject || !classId) {
        return res.status(400).json({ message: 'Subject and classId are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ message: 'Invalid classId' });
      }

      if (!id && !file) {
        return res.status(400).json({ message: 'Image is required when adding a new subject' });
      }

      const result = await subjectService.addOrUpdateSubject({ subject, classId, color, image, id });

      res.status(201).json({
        message: id ? 'Subject updated' : 'Subject added',
        subject: result
      });
    } catch (err) {
      res.status(500).json({ message: 'Operation failed', error: err.message });
    }
  },

  // Search + Pagination + All
  getSubjectList: async (req, res) => {
    try {
      const { query = '', limit = 10, offset = 0 } = req.query;

      const result = await subjectService.getFilteredSubjects(
        query,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
  },

  // Smart Delete (single or multiple)
  deleteSubjectSmart: async (req, res) => {
    try {
      const { id, ids } = req.body;

      if (id) {
        await subjectService.deleteSubject(id);
        return res.status(200).json({ message: 'Subject deleted' });
      }

      if (Array.isArray(ids) && ids.length > 0) {
        await subjectService.deleteMultiple(ids);
        return res.status(200).json({ message: 'Subjects deleted successfully' });
      }

      return res.status(400).json({ message: 'Please provide id or ids[] to delete' });
    } catch (err) {
      res.status(500).json({ message: 'Delete failed', error: err.message });
    }
  },

  // Change status
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await subjectService.updateStatus(id, status);
      res.status(200).json({ message: 'Status updated', subject: result });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Get subjects by class
  getSubjectsByClass: async (req, res) => {
    try {
      const { classId } = req.params;
      const subjects = await subjectService.getSubjectsByClass(classId);
      res.status(200).json(subjects);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
  },
};

module.exports = subjectController;
