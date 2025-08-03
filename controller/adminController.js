  const adminService = require("../service/adminService");

  const adminController = {
    register: async (req, res) => {
      try {
        const result = await adminService.registerAdmin(req.body);
        res.status(201).json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },
    verifyRegistrationOtp: async (req, res) => {
  try {
    const result = await adminService.verifyRegistrationOtp({
      email: req.admin.email,
      otp: req.body.otp,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
},


    loginStep1: async (req, res) => {
      try {
        const result = await adminService.loginAdminStep1(req.body);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

   verifyLoginOtp: async (req, res) => {
  try {
    const result = await adminService.verifyLoginOtp({
      email: req.admin.email,
      otp: req.body.otp,
    });
    res.status(200).json(result); // This returns final login token
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
},
    sendResetOtp: async (req, res) => {
      try {
        const result = await adminService.sendResetPasswordOtp(req.body.email);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

    verifyResetOtp: async (req, res) => {
      try {
        const result = await adminService.verifyResetPasswordOtp(
          {email:req.body.email, otp:
            req.body.otp
      });
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

    resetPassword: async (req, res) => {
      try {
        const result = await adminService.resetPassword(
          {email:req.body.email, newPassword:req.body.newPassword});
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },


 getAdminDetails: async (req, res) => {
  try {
    const result = await adminService.getAdminDetails(req.admin._id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
},
  }
 
module.exports = adminController;
