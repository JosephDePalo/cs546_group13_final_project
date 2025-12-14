import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";

export const setUserInfo = async (req, res, next) => {
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
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password_hash -otp");
    if (!user) {
      req.user = null;
    }
    req.user = user;
  } catch (_) {
    req.user = null;
  }
  next();
};

export const isLoggedIn = async (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).redirect("/login");
  }
};

export const isNotLoggedIn = async (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    res.redirect("/home");
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.is_admin) {
    next();
  } else {
    return res.status(403).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Not authorized as admin.`,
    });
  }
};

export const isAdminOrTargetUser = (req, res, next) => {
  if (req.user?.is_admin) {
    next();
  } else if (!req.params?.id) {
    return res.status(404).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Target ID is not set.`,
    });
  } else if (req.params.id === req.user?._id.toString()) {
    next();
  } else {
    return res.status(403).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Not authorized to view this resource`,
    });
  }
};

export const isAdminOrEventOrganizer = async (req, res, next) => {
  if (req.user?.is_admin) {
    next();
  } else if (!req.params?.id) {
    return res.status(404).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Target ID is not set.`,
    });
  } else {
    try {
      const event = await Event.findById(req.params.id).select("organizer_id");
      if (event.organizer_id === req.user._id.toString()) {
        next();
      } else {
        return res.status(403).render("error", {
          page_title: "Register | Volunteer Forum",
          logged_in: Boolean(req.user),
          user_id: req.user ? req.user._id : null,
          message: `Not authorized to view this resource`,
        });
      }
    } catch (_) {
      return res.status(403).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Not authorized to view this resource`,
      });
    }
  }
};
