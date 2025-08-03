
const mongoose = require("mongoose");

const pendingAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpire: { type: Date },
});

module.exports = mongoose.model("PendingAdmin", pendingAdminSchema);
