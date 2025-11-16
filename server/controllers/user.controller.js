import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import User from "../models/user.model.js";

// @desc     Auth user & get token
// @route    POST /api/users/login
// @access   Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const safeUser = user.toObject();
    delete safeUser.password_hash;
    delete safeUser.otp;

    res.json({
      login: "success",
      user: {
        username: user.username,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc     Register a new user
// @route    POST /api/users
// @access   Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "A user with this information already exists." });
    }

    const user = await User.create({
      username,
      email,
      password_hash: password,
    });

    const safeUser = user.toObject();
    delete safeUser.password_hash;
    delete safeUser.otp;

    res.json({
      user: {
        username: user.username,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Unable to create user." });
  }
};

// @desc     Get user profile
// @route    GET /api/users/profile
// @access   Private
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found." });
    }

    const safeUser = req.user.toObject();
    delete safeUser.password_hash;
    delete safeUser.otp;

    res.json(safeUser);
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc     Update user profile
// @route    PUT /api/users/profile
// @access   Private
export const updateUserProfile = async (req, res) => {
  try {
    let updates = req.body;

    delete updates._id;
    delete updates.is_admin;
    delete updates.account_stats;
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password_hash -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Unable to update profile." });
  }
};

// @desc     Update user password
// @route    PUT /api/users/password
// @access   Private
export const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Both fields are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await user.matchPassword(current_password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);

    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Password update error:", err.message);
    res.status(500).json({ message: "Unable to update password." });
  }
};

// @desc     Get all users (admin)
// @route    GET /api/users
// @access   Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password_hash -otp");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc     Get user by ID (admin)
// @route    GET /api/users/:id
// @access   Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password_hash -otp"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ message: "Unable to fetch user." });
  }
};

// @desc     Delete user (admin)
// @route    DELETE /api/users/:id
// @access   Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);

    if (!u) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ message: "Unable to delete user." });
  }
};
