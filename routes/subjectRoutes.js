const express = require('express');
const router = express.Router();
const subjectController = require('../controller/subjectController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Add or update subject
router.post('/add', protect, upload.single('image'), subjectController.addOrUpdateSubject);

// Search + pagination + all
router.get('/list', protect, subjectController.getSubjectList);

// Smart delete (single or multiple)
router.delete('/delete', protect, subjectController.deleteSubjectSmart);

// Change status
router.put('/status/:id', protect, subjectController.changeStatus);

// Get subjects by class
router.get('/class/:classId', protect, subjectController.getSubjectsByClass);

module.exports = router;
