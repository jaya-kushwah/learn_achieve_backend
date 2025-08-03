  const Admin = require("../model/adminModel");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const ADMIN_ROLE = require("../enums/adminRoleEnum");
  const RESPONSE_MESSAGES = require("../enums/responseMessageEnum");
  const { generateOtp, sendOtpEmail } = require("./otpService");
  const PendingAdmin = require("../model/pendingAdminModel");
  const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
  const adminService = {
 

 registerAdmin: async ({ email, password }) => {
  const existing = await Admin.findOne({ email });
  if (existing) throw new Error(RESPONSE_MESSAGES.ADMIN_EXISTS);

  const existingPending = await PendingAdmin.findOne({ email });
  if (existingPending) await existingPending.deleteOne();

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp(6);
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  const pending = await PendingAdmin.create({
    email,
    password: hashedPassword,
    otp,
    otpExpire,
  });

  await sendOtpEmail(email, otp, "Registration Verification");
   console.log(`Registration OTP for ${email}: ${otp}`);

  //  Temporary token for OTP verification
  const tempToken = jwt.sign(
    { email: pending.email }, // only email needed
    JWT_SECRET,
    { expiresIn: "10m" }
  );

  return { message: RESPONSE_MESSAGES.ADMIN_REGISTERED, token: tempToken ,otp: otp };
},

  verifyRegistrationOtp: async ({ email, otp }) => {
  const pending = await PendingAdmin.findOne({ email });
  if (!pending) throw new Error("Pending admin not found");

  if (pending.otp !== otp || !pending.otpExpire || pending.otpExpire < new Date()) {
    throw new Error(RESPONSE_MESSAGES.OTP_INVALID);
  }

  const admin = await Admin.create({
    email: pending.email,
    password: pending.password,
    role: ADMIN_ROLE.ADMIN,
    isVerified: true,
  });
  await pending.deleteOne();
  //  Final token after verified
  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { message: RESPONSE_MESSAGES.OTP_VERIFIED, token };
},

 
  loginAdminStep1: async ({ email, password }) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error(RESPONSE_MESSAGES.ADMIN_NOT_FOUND);

    if (!admin.isVerified) throw new Error("Please verify your account first.");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error(RESPONSE_MESSAGES.INVALID_CREDENTIALS);

    const loginOtp = generateOtp(6);
    const loginOtpExpire = new Date(Date.now() + 10 * 60 * 1000);

    admin.loginOtp = loginOtp;
    admin.loginOtpExpire = loginOtpExpire;
    await admin.save();

    await sendOtpEmail(email, loginOtp, "Login 2-Step Verification");
    console.log(`Login OTP for ${email}: ${loginOtp}`);

   
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    return {
      message: RESPONSE_MESSAGES.LOGIN_OTP_SENT,
      token: token, //  now this will be visible in Postman
      otp:loginOtp
    };
  },


  verifyLoginOtp: async ({ email, otp }) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error(RESPONSE_MESSAGES.ADMIN_NOT_FOUND);

    if (
      admin.loginOtp !== otp ||
      !admin.loginOtpExpire ||
      admin.loginOtpExpire < new Date()
    ) {
      throw new Error(RESPONSE_MESSAGES.OTP_INVALID);
    }

    admin.loginOtp = null;
    admin.loginOtpExpire = null;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    return { message: "Login successful", token };
  },
  // Password reset: send OTP
  sendResetPasswordOtp : async (email) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error(RESPONSE_MESSAGES.ADMIN_NOT_FOUND);

    const otp = generateOtp(6);
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    admin.otp = otp;
    admin.otpExpire = otpExpire;
    await admin.save();

    await sendOtpEmail(email, otp, "Password Reset");
    console.log(`Password Reset OTP for ${email}: ${otp}`);


    return { message: RESPONSE_MESSAGES.OTP_SENT };
  },

  // Verify OTP for password reset
  verifyResetPasswordOtp : async ({ email, otp }) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error(RESPONSE_MESSAGES.ADMIN_NOT_FOUND);

    if (
      admin.otp !== otp ||
      !admin.otpExpire ||
      admin.otpExpire < new Date()
    ) {
      throw new Error(RESPONSE_MESSAGES.OTP_INVALID);
    }

    // OTP valid, clear OTP (but keep isVerified true)
    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    return { message: RESPONSE_MESSAGES.OTP_VERIFIED };
  },

  // Reset password after OTP verified
  resetPassword : async ({ email, newPassword }) => {
    const admin = await Admin.findOne({ email });
    if (!admin) throw new Error(RESPONSE_MESSAGES.ADMIN_NOT_FOUND);


    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return { message: RESPONSE_MESSAGES.PASSWORD_RESET_SUCCESS };
  },


  getAdminDetails: async (adminId) => {
  const admin = await Admin.findById(adminId).select("-__v -otp -otpExpire -loginOtp -loginOtpExpire");
  if (!admin) throw new Error("Admin not found");
  return admin;
},
}
  module.exports = adminService; 

