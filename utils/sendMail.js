const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });

    const mailOptions = {
      from: `"Student Registration" <${process.env.USER_EMAIL}>`,
      to,
      subject,
      html,
    };

    // Extract OTP from the HTML and log it (basic method)
    const otpMatch = html.match(/\b\d{4,6}\b/); // Matches 4-6 digit number
    if (otpMatch) {
      console.log(`OTP sent to ${to}: ${otpMatch[0]}`);
    }

    await transporter.sendMail(mailOptions);
    console.log(`Mail sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendMail;