import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided." });
    }

    // Support for "Bearer <token>" format
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without sensitive fields
    const user = await User.findById(decoded.id).select("-password_hash -otp");

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Not authorized." });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin." });
  }
};
