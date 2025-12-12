import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.Authorization) {
      token = req.cookies.Authorization;
    } else if (req.headers.authorization) {
      token = req.headers.authorization;
      if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
      }
    }

    if (!token) {
      return handleAuthFailure(req, res);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password_hash -otp");
    if (!user) {
      return handleAuthFailure(req, res);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return handleAuthFailure(req, res);
  }
};

// Helper: decide redirect vs JSON
const handleAuthFailure = (req, res) => {
  if (!req.originalUrl.startsWith("/api")) {
    return res.redirect("/home");
  }
  return res.status(401).json({ message: "Not authorized." });
};

export const admin = (req, res, next) => {
  if (req.user && req.user.is_admin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin." });
  }
};
