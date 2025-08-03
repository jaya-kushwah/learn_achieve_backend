const mongoose = require("mongoose");
const ADMIN_ROLE = require("../enums/adminRoleEnum");

const adminSchema = new mongoose.Schema({
  name:{type:String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ADMIN_ROLE), default: ADMIN_ROLE.ADMIN },
  otp: { type: String },
  otpExpire: { type: Date },
  isVerified: { type: Boolean, default: false },
  loginOtp: { type: String },
  loginOtpExpire: { type: Date },
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
