import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import User from "../models/user.model.js";

// @desc     Auth user, set JWT cookie, redirect to protected page
// @route    POST /api/v1/users/login
// @access   Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = generateToken(user._id);

    res.cookie("Authorization", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/api/v1/events");
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// @desc     Register a new user
// @route    POST /api/users
// @access   Public
export const register = async (req, res) => {
  try {
    const { username, email, password, is_admin } = req.body;

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
      is_admin: Boolean(is_admin),
    });

    const safeUser = user.toObject();
    delete safeUser.password_hash;
    delete safeUser.otp;

    res.redirect("/login");
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
    const user = await User.findById(req.params.id)
      .select("-password_hash -otp")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.render("user_profile", {
      page_title: `${user.username} | Volunteer Forum`,
      ...user,
    });
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ message: "Unable to fetch user." });
  }
};

export const updateUserById = async (req, res) => {
  try {
    let updates = req.body;

    delete updates._id;
    delete updates.is_admin;
    delete updates.account_stats;
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password_hash -otp");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.redirect(`/api/v1/users/${req.params.id}`);
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Unable to update profile." });
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

// @desc     Logout user
// @route    POST /api/v1/users/logout
// @access   Private
export const logout = (req, res) => {
  // Clear authentication cookie and redirect to login page
  res.clearCookie("Authorization", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.MODE === "production",
  });

  return res.redirect("/home");
};
