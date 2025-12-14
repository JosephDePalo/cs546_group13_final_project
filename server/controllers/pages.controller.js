import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import Comment from "../models/comments.model.js";
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
    const eventId = req.params.id;
    const event = await Event.findById(eventId).lean();

    if (!event) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event not found.`,
      });
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

    const comments = await Comment.getEventComments(
      eventId,
      1, // page
      20, // limit
    );

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const c = comment.toObject ? comment.toObject() : comment;
        const replies = await Comment.getCommentReplies(comment._id, 1, 10);

        const replies2 = replies.map((r) => {
          const rr = r.toObject ? r.toObject() : r;
          return {
            ...rr,
            id: rr._id.toString(),
            user_id_str: rr.user_id._id.toString(),
          };
        });

        return {
          ...c,
          id: c._id.toString(),
          user_id_str: c.user_id._id.toString(),
          replies: replies2,
        };
      }),
    );

    const sUser = req.user
      ? {
          ...req.user.toObject(),
          id: req.user._id.toString(),
        }
      : null;

    res.render("event_details", {
      page_title: `${event.title} | Volunteer Forum`,
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      is_owner_or_admin:
        req.user.is_admin ||
        req.user?._id.toString() === event.organizer_id.toString(),
      isRegistered,
      ...event,
      formatted_start_time,
      formatted_end_time,
      user: sUser,
      comments: commentsWithReplies, //added by Julian
    });
  } catch (err) {
    console.error("Get event error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to fetch event.`,
    });
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
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to fetch events.`,
    });
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
    return res.status(404).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Event does not exist`,
    });
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
