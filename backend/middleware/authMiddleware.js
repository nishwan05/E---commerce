const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Not logged in" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const adminMiddleware = (req, res, next) => {
  const allowedRoles = ["admin", "superadmin"];
  const userRole = req.user?.role?.toLowerCase();
  if (!allowedRoles.includes(userRole))
    return res.status(403).json({ success: false, message: "Admin access only" });
  next();
};

module.exports = { authMiddleware, adminMiddleware };
