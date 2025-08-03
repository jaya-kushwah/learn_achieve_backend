const express = require("express");
const router = express.Router();

const adminController = require("../controller/adminController");
const { protect } = require("../middleware/authMiddleware");

// Registration + OTP verify
router.post("/register", adminController.register);
router.post("/verify-registration-otp",protect, adminController.verifyRegistrationOtp);

// Login step 1 and 2 (OTP verify)
router.post("/login", adminController.loginStep1);
router.post("/verify-login-otp", protect, adminController.verifyLoginOtp); 

// Password reset
router.post("/send-reset-otp", adminController.sendResetOtp); 
router.post("/verify-reset-otp",adminController.verifyResetOtp);
router.post("/reset-password",adminController.resetPassword);

//get admin details 
router.get("/me", protect, adminController.getAdminDetails);


// Protected admin dashboard example
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: "Welcome Admin", admin: req.admin });
});
module.exports = router;
