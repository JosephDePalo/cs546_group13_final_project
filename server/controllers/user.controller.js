import generateToken from "../utils/generateToken.js";
import User from "../models/user.model.js";

// @desc     Auth user & get token
// @route    POST /api/users/login
// @access   Public
export const login = async (req, res) => {
  const { name, password } = req.body;
  console.log(req.body);

  const user = await User.findOne({ name: name });

  if (user && (await user.matchPassword(password))) {
    delete user.password;
    res.json({
      login: "success",
      user: {
        name: user.name,
      },
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

// @desc     Register a new user
// @route    POST /api/users
// @access   Public
export const register = async (req, res) => {
  const { name, password } = req.body;

  const userExists = await User.findOne({ name: name });

  if (!userExists) {
    const user = await User.create({ name, password });

    if (user) {
      delete user["password"];
      res.json({
        user: {
          name: user.name,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user dataa" });
    }
  } else {
    return res.status(400).json({ message: "User already exists" });
  }
};

// @desc     GET user profile
// @route    GET /api/users/profile
// @access   Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user comes from protect middleware
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(req.user);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc     Update user profile
// @route    PUT /api/users/profile
// @access   Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;

    if (req.body.password) {
      user.password = req.body.password; // Will be hashed by pre-save hook
    }

    const updatedUser = await user.save();

    res.json({
      name: updatedUser.name,
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
