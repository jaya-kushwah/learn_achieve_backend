const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");

// Registration
router.post("/register", controller.register);
router.post("/verify", protect, controller.verifyRegistration);

// Login
router.post("/login", controller.loginStep1);
router.post("/verify-login", controller.verifyLogin);

// Forgot Password
router.post("/send-reset-otp", controller.sendResetOtp);
router.post("/verify-reset-otp", protect, controller.verifyResetOtp);
router.post("/reset-password",protect, controller.resetPassword);
router.get("/me", protect, controller.getAdminDetails);

module.exports = router;


