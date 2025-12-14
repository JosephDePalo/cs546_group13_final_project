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
      return res.status(401).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Invalid username or password`,
      });
    }

    const token = generateToken(user._id);

    res.cookie("Authorization", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/events");
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Internal server error`,
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
      return res.status(400).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `A user with this information already exists.`,
      });
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
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to create user.`,
    });
  }
};

// @desc     Get user profile
// @route    GET /api/users/profile
// @access   Private
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    const safeUser = req.user.toObject();
    delete safeUser.password_hash;
    delete safeUser.otp;

    res.json(safeUser);
  } catch (err) {
    console.error("Profile error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Internal server error.`,
    });
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
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile update error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to update profile.`,
    });
  }
};

// @desc     Update user password
// @route    PUT /api/users/password
// @access   Private
export const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Both current password and new password are required`,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    const isMatch = await user.matchPassword(current_password);
    if (!isMatch) {
      return res.status(401).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Current password is incorrect.`,
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);

    await user.save();

    res.redirect(`/api/v1/users/${user._id}`);
  } catch (err) {
    console.error("Password update error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to update password.`,
    });
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
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Internal server error.`,
    });
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
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    res.render("user_profile", {
      page_title: `${user.username} | Volunteer Forum`,
      logged_in: Boolean(req.user),
      is_owner_or_admin:
        req.user.is_admin || req.user?._id.toString() === req.params.id,
      user_id: req.user ? req.user._id : null,
      ...user,
    });
  } catch (err) {
    console.error("Get user error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to fetch user.`,
    });
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
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    res.redirect(`/api/v1/users/${req.params.id}`);
  } catch (err) {
    console.error("Profile update error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to update profile.`,
    });
  }
};

// @desc     Delete user (admin)
// @route    DELETE /api/users/:id
// @access   Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);

    if (!u) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to delete user.`,
    });
  }
};

// @desc     Logout user
// @route    GET /api/v1/users/logout
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
