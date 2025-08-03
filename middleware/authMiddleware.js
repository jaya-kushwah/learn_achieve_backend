const jwt = require("jsonwebtoken");
const Admin = require("../model/adminModel");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

 const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ CASE 1: Final token after registration/login (has id)
    if (decoded.id) {
      const admin = await Admin.findById(decoded.id);
      if (!admin) return res.status(404).json({ message: "Admin not found" });
    req.admin = admin;
    } 
    // ✅ CASE 2: Temp token for registration OTP (has only email)
    else if (decoded.email) {
      req.admin = { email: decoded.email };
    } 
    else {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};


module.exports = { protect ,verifyToken};
