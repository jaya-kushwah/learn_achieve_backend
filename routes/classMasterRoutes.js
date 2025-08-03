const express = require('express');
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const classMasterController = require('../controller/classMasterController');


// Get all classes (active + inactive) with pagination + search
router.get('/all', protect, classMasterController.getAllClasses);

// add and update with same routes
router.post('/addandupdate', protect, classMasterController.addOrUpdateClass);

// DELETE single and multiple classes by IDs
router.delete('/', protect, classMasterController.deleteClass);

// Toggle active/inactive
router.put('/toggle/:id', protect, classMasterController.toggleActive);
module.exports = router;
