const userService = require("../service/userService");
exports.register = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
  
exports.verifyRegistration = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await userService.verifyRegistrationOtp(token, req.body.otp);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.loginStep1 = async (req, res) => {
  try {
    console.log("done");
     const result = await userService.loginStep1(req.body);
    res.json(result); 
    console.log("done1");
    } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.verifyLogin = async (req, res) => {
    try {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await userService.verifyLoginOtp(token, req.body.otp);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
      }
};

exports.sendResetOtp = async (req, res) => {
  try {
    const result = await userService.sendResetOtp(req.body.email);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.verifyResetOtp = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await userService.verifyResetOtp(token, req.body.otp);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const newPassword = req.body.newPassword;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
        const result = await userService.resetPassword(token, newPassword);
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getAdminDetails=async (req, res) => {
  try {
    const result = await userService.getUserDetails(req.admin._id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};