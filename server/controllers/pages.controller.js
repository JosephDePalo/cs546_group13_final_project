import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import { formatDateTimeLocal } from "../utils/helpers.js";
import EventRegistration from "../models/eventreg.model.js";

export const renderHome = (req, res) => {
  res.render("home", {
    page_title: "Volunteer Forum",
    logged_in: Boolean(req.user),
    user_id: req.user ? req.user._id : null,
  });
};

export const renderEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const formatted_start_time = formatDateTimeLocal(event.start_time);
    const formatted_end_time = formatDateTimeLocal(event.end_time);

    let isRegistered = false;

    if (req.user) {
      const existingReg = await EventRegistration.findOne({
        user_id: req.user._id,
        event_id: event._id,
        cancelled: false,
      });

      if (existingReg) {
        isRegistered = true;
      }
    }

    res.render("event_details", {
      page_title: `${event.title} | Volunteer Forum`,
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      isRegistered,
      ...event,
      formatted_start_time,
      formatted_end_time,
    });
  } catch (err) {
    console.error("Get event error:", err.message);
    res.status(500).json({ message: "Unable to fetch event." });
  }
};

export const renderEventsList = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const events = await Event.getEvents(page, limit).lean();
    const eventCount = await Event.countDocuments();
    const pageCount = Math.ceil(eventCount / limit);
    res.render("event_feed", {
      events,
      page_title: "Event Feed | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      page_details: {
        is_next_page: pageCount > page,
        next_page: parseInt(page) + 1,
        is_prev_page: page != 1,
        prev_page: parseInt(page) - 1,
        current_page: page,
        page_limit: limit,
      },
    });
  } catch (err) {
    console.error("Get events error:", err.message);
    res.status(500).json({ message: "Unable to fetch events." });
  }
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

    const registrations = await EventRegistration.find({
      event_id: req.params.id,
      cancelled: false,
    })
      .populate("user_id", "username email")
      .lean();

    res.render("event_management", {
      page_title: "Event Management | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      ...event,
      formatted_start_time,
      formatted_end_time,
      registrations,
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
    user_id: req.user?._id,
    target_type: target_type,
    target_id: req.params.id,
  });
};
