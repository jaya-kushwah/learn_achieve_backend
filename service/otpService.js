const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

function generateOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

const sendOtpEmail = async (email, otp, purpose = "Verification") => {
  try {
    await transporter.sendMail({
      from: `"Admin Auth" <${process.env.USER_EMAIL}>`,
      to: email,
      subject: `${purpose} OTP`,
      html: `<h3>Your OTP for ${purpose} is: <b>${otp}</b></h3><p>This OTP is valid for 10 minutes.</p>`,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Error sending OTP email");
  }
};

module.exports = {
  generateOtp,
  sendOtpEmail,
};
