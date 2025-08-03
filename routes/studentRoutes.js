const express = require("express");
const router = express.Router();
const studentController = require("../controller/studentController");

router.post("/register", studentController.registerStudent);
router.post("/verify", studentController.verifyStudentOTP);

router.post("/login", studentController.loginRequestStudent);
router.post("/login/verify", studentController.loginVerifyStudent);


module.exports = router;