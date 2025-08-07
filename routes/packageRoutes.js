const express = require('express');
const router = express.Router();
const packageController = require('../controller/packageController');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware'); 

//add and update
router.post('/add', upload.single('image'), packageController.addOrUpdatePackage);
//  Delete package by ID (protected)
router.delete('/delete/:id', verifyToken, packageController.deletePackage);
// Get all packages (protected)
router.get('/', verifyToken,packageController.getPackages);
// http://localhost:5000/api/packages?query=start&limit=5&offset=0  search
// http://localhost:5000/api/packages get
router.delete('/delete-multiple', verifyToken, packageController.deleteMultiplePackages);

router.patch('/toggle/:id', verifyToken, packageController.togglePackageStatus);



// router.get('/view/:packageId',verifyToken, packageController.getPackageWithMockTests);
module.exports = router;   
