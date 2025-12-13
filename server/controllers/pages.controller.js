import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import { formatDateTimeLocal } from "../utils/helpers.js";

export const renderHome = (req, res) => {
  res.render("home", {
    page_title: "Volunteer Forum",
  });
};

export const renderRegister = (req, res) => {
  res.render("register", {
    page_title: "Register | Volunteer Forum",
  });
};

export const exampleProtectedPage = (req, res) => {
  res.render("exampleProtectedPage", {
    page_title: "Protected Page",
    user: req.user.toObject(),
  });
};

export const renderLogin = (req, res) => {
  res.render("login", {
    page_title: "Login | Volunteer Forum",
  });
};

export const renderLeaderboard = async (req, res) => {
  const top_users = await User.getTopUsers();
  console.log(top_users);
  res.render("leaderboard", {
    page_title: "Leaderboard | Volunteer Forum",
    users: top_users,
  });
};

export const renderNewEvent = (req, res) => {
  res.render("new_event", {
    page_title: "New Event | Volunteer Forum",
  });
};

export const renderEventManagement = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id).lean();
    const formatted_start_time = formatDateTimeLocal(event.start_time);
    const formatted_end_time = formatDateTimeLocal(event.end_time);

    res.render("event_management", {
      page_title: "Event Management | Volunteer Forum",
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
    ...user,
  });
};
