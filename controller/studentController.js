
const studentService = require("../service/studentServices");

exports.registerStudent = async (req, res) => {
  try {
    const result = await studentService.registerStudent(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.verifyStudentOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await studentService.verifyStudentOTP(email, otp);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Step 1: Login request → verify email/password → send OTP
exports.loginRequestStudent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await studentService.loginRequestStudent(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.loginVerifyStudent = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await studentService.loginVerifyStudent(email, otp);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};