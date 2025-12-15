import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import User from "../models/user.model.js";
import Friendship from "../models/friendship.model.js";
import xss from "xss";

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

    // XSS
    let valid_username = xss(username);
    let valid_email = xss(email);
    
    const user = await User.create({
      username: valid_username,
      email: valid_email,
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

    updates.username = xss(updates.username);
    updates.email = xss(updates.email);
    updates.phone = xss(updates.phone);
    updates.first_name = xss(updates.first_name);
    updates.last_name = xss(updates.last_name);
    updates.gender = xss(updates.gender);
    updates.city = xss(updates.city);
    updates.state = xss(updates.state);
    updates.age = xss(updates.age);
    updates.otp = xss(updates.otp);

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
    const profileUser = await User.findById(req.params.id)
      .select("-password_hash -otp")
      .lean();

    if (!profileUser) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User not found.`,
      });
    }

    const currentUser = req.user || null;
    const is_self =
      currentUser && currentUser._id.toString() === profileUser._id.toString();
    let friendship_status = "none";
    let is_requester = false;
    let pending_requests = [];
    let friends = [];

    if (currentUser) {
      const friendship = await Friendship.findOne({
        $or: [
          { user_id: currentUser._id, friend_id: profileUser._id },
          { user_id: profileUser._id, friend_id: currentUser._id },
        ],
      }).lean();
      if (friendship) {
        friendship_status = friendship.status;
        is_requester =
          friendship.user_id.toString() === currentUser._id.toString();
      }

      if (is_self) {
        pending_requests = await Friendship.find({
          friend_id: currentUser._id,
          status: "pending",
        })
          .populate("friend_id", "username")
          .lean();

        friends = await Friendship.find({
          status: "accepted",
          $or: [{ user_id: currentUser._id }, { friend_id: currentUser._id }],
        })
          .populate("user_id friend_id", "username")
          .lean();

        friends = friends.map((f) => {
          const is_me = f.user_id._id.toString() === currentUser._id.toString();
          const friendUser = is_me ? f.friend_id : f.user_id;
          return {
            friendship_id: f._id.toString(),
            _id: friendUser._id.toString(),
            username: friendUser.username,
          };
        });
      }
    }
    res.render("user_profile", {
      page_title: `${profileUser.username} | Volunteer Forum`,
      logged_in: Boolean(currentUser),
      user: currentUser,
      profileUser, //The user being viewed
      is_self,
      friendship_status,
      is_requester,
      pending_requests,
      friends,
      is_owner_or_admin:
        currentUser &&
        (currentUser.is_admin ||
          currentUser._id.toString() === profileUser._id.toString()),
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

    updates.username = xss(updates.username);
    updates.email = xss(updates.email);
    updates.phone = xss(updates.phone);
    updates.first_name = xss(updates.first_name);
    updates.last_name = xss(updates.last_name);
    updates.gender = xss(updates.gender);
    updates.city = xss(updates.city);
    updates.state = xss(updates.state);
    updates.age = xss(updates.age);
    updates.otp = xss(updates.otp);

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
