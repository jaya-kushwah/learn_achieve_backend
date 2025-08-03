const RESPONSE_MESSAGES = {
  ADMIN_EXISTS: "Admin already exists",
  // USER_EXISTS: "User already exists",

  ADMIN_REGISTERED: "Admin registered successfully. Please verify OTP sent to your email.",
  // USER_REGISTERED: "User registered successfully. Please verify OTP sent to your email.",

  ADMIN_NOT_FOUND: "Admin not found",
  // USER_NOT_FOUND: "User not found",

  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_INVALID: "Invalid or expired token",
  NO_TOKEN: "No token, authorization denied",
  OTP_SENT: "OTP sent successfully",
  OTP_INVALID: "Invalid or expired OTP",
  OTP_VERIFIED: "OTP verified successfully",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  LOGIN_OTP_SENT: "OTP sent for login verification",
  LOGIN_SUCCESS: "Login successful",

  
  USER_EXISTS: "User already exists",
  USER_REGISTERED: "User registered successfully. Please verify OTP.",
  USER_NOT_FOUND: "User not found",

  OTP_SENT: "OTP sent successfully",
  OTP_INVALID: "Invalid or expired OTP",
  OTP_VERIFIED: "OTP verified successfully",

  INVALID_CREDENTIALS: "Invalid email or password",
  LOGIN_OTP_SENT: "Login OTP sent",
  LOGIN_SUCCESS: "Login successful",


  RESET_OTP_SENT: "Reset OTP sent to email.",
RESET_OTP_VERIFIED: "Reset OTP verified successfully.",
PASSWORD_RESET_SUCCESS: "Password has been reset successfully.",


};

module.exports = RESPONSE_MESSAGES;
