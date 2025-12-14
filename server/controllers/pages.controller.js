import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import { formatDateTimeLocal } from "../utils/helpers.js";

export const renderHome = (req, res) => {
  res.render("home", {
    page_title: "Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
  });
};

export const renderRegister = (req, res) => {
  res.render("register", {
    page_title: "Register | Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
  });
};

export const exampleProtectedPage = (req, res) => {
  res.render("exampleProtectedPage", {
    page_title: "Protected Page",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
    user: req.user.toObject(),
  });
};

export const renderLogin = (req, res) => {
  res.render("login", {
    page_title: "Login | Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
  });
};

export const renderLeaderboard = async (req, res) => {
  const top_users = await User.getTopUsers();
  res.render("leaderboard", {
    page_title: "Leaderboard | Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
    users: top_users,
  });
};

export const renderNewEvent = (req, res) => {
  res.render("new_event", {
    page_title: "New Event | Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
  });
};

export const renderEventManagement = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id).lean();
    const formatted_start_time = formatDateTimeLocal(event.start_time);
    const formatted_end_time = formatDateTimeLocal(event.end_time);

    res.render("event_management", {
      page_title: "Event Management | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      ...event,
      formatted_start_time,
      formatted_end_time,
    });
  } catch (err) {
    console.error("renderEventManagement error: " + err.message);
    res.status(404).json({ error: "event does not exist" });
  }
};

export const renderEditProfile = async (req, res) => {
  let user = await User.findById(req.params.id).lean();
  res.render("edit_profile", {
    page_title: "Edit Profile | Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
    ...user,
  });
};

export const renderNewReport = (req, res, target_type) => {
  res.render("report_editor", {
    title: "New Report | Volunteer Forum",
    logged_in: Boolean(req.user),
    _id: req.user._id,
    type: target_type,
    target_id: req.params.id,
  });
};
