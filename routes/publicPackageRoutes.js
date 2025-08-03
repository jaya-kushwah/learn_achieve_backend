// routes/publicPackageRoutes.js
const express = require('express');
const router = express.Router();
const packageController = require('../controller/packageController');

// Publicly accessible route — for users
router.get('/packages', packageController.getAllPackages); 

module.exports = router;
