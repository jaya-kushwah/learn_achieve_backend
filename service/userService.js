const User = require("../model/userModel");
const PendingUser = require("../model/pendingUserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { otp: generateOtp, sentOtp: sendOtpEmail } = require("../utils/otpUtils");
const otpUtils = require("../utils/otpUtils");
const {generateReferralCode} = require("../utils/referralUtils")

const RESPONSE = require("../enums/responseMessageEnum");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const userService = {
// Inside userService
registerUser: async ({ email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error(RESPONSE.USER_EXISTS);

  await PendingUser.deleteOne({ email });

  const hashed = await bcrypt.hash(password, 10);
  const otp = otpUtils.otp(6);
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  await PendingUser.create({ email, password: hashed, otp, otpExpire });
  await otpUtils.sentOtp(email, otp);

  // Generate a temporary token (only for verifying OTP)
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

  return {
    message: RESPONSE.USER_REGISTERED,
    token, // Return token to frontend
  };
},

// verifyRegistrationOtp: async (token, otp) => {
//   const decoded = jwt.verify(token, JWT_SECRET);
//   const email = decoded.email;

//   const pending = await PendingUser.findOne({ email });
//   if (!pending || pending.otp !== otp || pending.otpExpire < new Date())
//     throw new Error(RESPONSE.OTP_INVALID);

//   const user = await User.create({
//     email,
//     password: pending.password,
//     isVerified: true,
//   });

//   await pending.deleteOne();
//   return { message: RESPONSE.OTP_VERIFIED };
// },`

verifyRegistrationOtp: async (token, otp) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;

  const pending = await PendingUser.findOne({ email });
  if (!pending || pending.otp !== otp || pending.otpExpire < new Date())
    throw new Error(RESPONSE.OTP_INVALID);

  
  const referralCode = generateReferralCode(email);
  const user = await User.create({
    email,
    password: pending.password,
    isVerified: true,
    referralCode,
    referredBy: pending.referredBy || null, // optional
  });

  await pending.deleteOne();

  return { message: RESPONSE.OTP_VERIFIED };
},
  

 loginStep1: async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error(RESPONSE.USER_NOT_FOUND);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error(RESPONSE.INVALID_CREDENTIALS);

  const otp = otpUtils.otp(6);
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.loginOtp = otp;
  user.loginOtpExpire = otpExpire;
  await user.save();

  await otpUtils.sentOtp(email, otp);

  // 🟡 Generate a short-lived token with the email only
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "10m" });

  return { message: RESPONSE.LOGIN_OTP_SENT, token };
},


 verifyLoginOtp: async (token, otp) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;

  const user = await User.findOne({ email });
  if (!user || user.loginOtp !== otp || user.loginOtpExpire < new Date())
    throw new Error(RESPONSE.OTP_INVALID);

  user.loginOtp = null;
  user.loginOtpExpire = null;
  await user.save();

  const loginToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

  return { message: RESPONSE.LOGIN_SUCCESS, token: loginToken };
},



sendResetOtp: async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error(RESPONSE.USER_NOT_FOUND);

  const otp = otpUtils.otp(6);
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.loginOtp = otp;
  user.loginOtpExpire = otpExpire;
  await user.save();

  await otpUtils.sentOtp(email, otp);

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

  return { message: "Reset OTP sent to email.", token };
},

// verifyResetOtp:async (token, otp) => {
//   const decoded = jwt.verify(token, JWT_SECRET);
//   const email = decoded.email;

//   const user = await User.findOne({ email });
//   if (!user || user.loginOtp !== otp || user.loginOtpExpire < new Date()) {
//     throw new Error(RESPONSE.OTP_INVALID);
//   }

//   user.loginOtp = null;
//   user.loginOtpExpire = null;
//   await user.save();

//   return { message: "Reset OTP verified successfully." };
// },
verifyResetOtp: async (token, otp) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;

  const user = await User.findOne({ email });
  if (!user || user.loginOtp !== otp || user.loginOtpExpire < new Date()) {
    throw new Error(RESPONSE.OTP_INVALID);
  }

  user.loginOtp = null;
  user.loginOtpExpire = null;
  await user.save();

  // 🟡 Issue new token for secure password reset
  const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });

  return {
    message: "Reset OTP verified successfully.",
    token: resetToken
  };
},


resetPassword: async (token, newPassword) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;

  const user = await User.findOne({ email });
  if (!user) throw new Error(RESPONSE.USER_NOT_FOUND);

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return { message: "Password has been reset successfully." };
},

  getUserDetails: async (userId) => {
  const user = await User.findById(userId).select("-__v -otp -otpExpire -loginOtp -loginOtpExpire");
  if (!user) throw new Error("Admin not found");
  return user;
},
}



module.exports = userService;





