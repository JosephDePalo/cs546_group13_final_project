import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      res.status(401).json({ message: "No Token Provided" });
    }

    // Validate user sent jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetching user without password
    let user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User does not exists" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

export { protect };
