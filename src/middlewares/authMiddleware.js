const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); // assuming a User model with role

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // full user object including role
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
