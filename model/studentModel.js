
const mongoose = require('mongoose');

const contactDetailsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  addressLine1: String,
  addressLine2: String,
  state: { type: String, required: true },
  district: { type: String },
  taluka: { type: String },
  pinCode: String
}, { _id: false });

const studentSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  dob: String,
  gender: String,
  medium: String,
  class: String,
  schoolName: String,

  registerBy: {
    type: String,
    enum: ["Student", "Coordinator"],
    required: true
  },

  uniqueCode: {
    type: String,
    validate: {
      validator: function (v) {
        return this.registerBy !== 'Coordinator' || (v && v.trim().length > 0);
      },
      message: "Unique code is required when registered by a Coordinator."
    }
  },

  contactDetails: {
    type: contactDetailsSchema,
    required: true,
    validate: {
      validator: function (v) {
        if (v.state === "Madhya Pradesh") {
          return v.district && v.taluka && v.pinCode;
        }
        return true;
      },
      message: "District, Taluka, and Pin Code are required when state is Madhya Pradesh."
    }
  },

  password: String, // hashed
  otp: String,
  otpExpiry: Date

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);