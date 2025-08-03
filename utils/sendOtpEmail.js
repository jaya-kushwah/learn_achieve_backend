const nodemailer = require('nodemailer');
require('dotenv').config();

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  const mailOptions = {
    from: `"Learn Achieve" <${process.env.USER_EMAIL}>`,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent to ${email} ${otp}`);
};

module.exports = sendOtpEmail;