const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");

function otp(n = 6) {
  let generatedOtp = "";
  for (let i = 0; i < n; i++) {
    generatedOtp += Math.floor(Math.random() * 10);
  }
  console.log("Generated OTP:", generatedOtp);
  return generatedOtp;
}

// Configure transporter using environment variables
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

// Send OTP email
const sentOtp = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"OTP Service" <${process.env.USER_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is:</b> <h1>${otp}</h1>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

module.exports = { otp, sentOtp };