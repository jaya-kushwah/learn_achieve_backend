// const mongoose = require("mongoose");

// const pendingUserSchema = new mongoose.Schema({
//   email: String,
//   password: String,
//   otp: String,
//   otpExpire: Date,
// });

// module.exports = mongoose.model("PendingUser", pendingUserSchema);


const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  email: String,
  password: String,
  otp: String,
  otpExpire: Date,
  referredBy: { type: String, default: null } // ✅ Add this
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
