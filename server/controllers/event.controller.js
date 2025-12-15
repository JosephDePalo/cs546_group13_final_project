import Event from "../models/event.model.js";
import EventRegistration from "../models/eventreg.model.js";
import User from "../models/user.model.js";
import { formatDateTimeLocal } from "../utils/helpers.js";
import Comment from "../models/comments.model.js";

// @desc     Create new event
// @route    POST /api/events
// @access   Private
export const newEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      location_url,
      start_time,
      end_time,
      max_capacity,
      address,
      city,
      state,
    } = req.body;

    const eventExists = await Event.findOne({
      $and: [
        { title },
        { organizer_id: req.user._id },
        { $or: [{ status: "Ongoing" }, { status: "Upcoming" }] },
      ],
    });
    if (eventExists) {
      return res.status(400).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `You have already created an upcoming or ongoing event with this title.`,
      });
    }

    const event = await Event.create({
      organizer_id: req.user._id,
      title,
      description,
      location_url,
      start_time,
      end_time,
      max_capacity,
      address,
      city,
      state,
    });

    res.redirect(`/events/${event._id}`);
  } catch (err) {
    console.error("New event error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Internal server error.`,
    });
  }
};

// @desc     Get event
// @route    GET /api/events/:id
// @access   Public

export const getEvent = async (req, res) => {
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
    if (event.disabled && !req.user.is_admin) {
      return res.status(403).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `You are not authorized to view a disabled event.`,
      });
    }

    const formatted_start_time = formatDateTimeLocal(event.start_time);
    const formatted_end_time = formatDateTimeLocal(event.end_time);

    const comments = await Comment.getEventComments(
      eventId,
      1, // page
      20, // limit
    );

    const commentsWithReplies = await comments.map(async (comment) => {
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
    });

    const sUser = req.user
      ? {
          ...req.user.toObject(),
          id: req.user._id.toString(),
        }
      : null;

    console.log(commentsWithReplies);
    res.json({
      page_title: `${event.title} | Volunteer Forum`,
      logged_in: Boolean(req.user),
      user: sUser, // added by Julian
      user_id: req.user ? req.user._id : null,
      ...event,
      formatted_start_time,
      formatted_end_time,
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

// @desc     Get event
// @route    GET /api/events
// @access   Public

export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const events = await Event.getEvents(page, limit).lean();
    const eventCount = await Event.countDocuments();
    const pageCount = Math.ceil(eventCount / limit);
    const eventFeed = {
      events,
      page_details: {
        is_next_page: pageCount > page,
        next_page: parseInt(page) + 1,
        is_prev_page: page != 1,
        prev_page: parseInt(page) - 1,
        current_page: page,
        page_limit: limit,
      },
    };

    res.json(eventFeed);
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

// @desc     Update event
// @route    PUT /api/events/:id
// @access   Private/Admin
export const updateEventDetails = async (req, res) => {
  try {
    let updates = req.body;

    delete updates._id;
    delete updates.organizer_id;
    delete updates.disabled;
    delete updates.disabled_at;
    delete updates.disabled_by;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event not found.`,
      });
    } else if (!req.user.is_admin && !event.organizer_id.equals(req.user._id)) {
      return res.status(403).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User does not own this event.`,
      });
    }

    // Freezing status completed. Admins can unfreeze it(have the ability to change it from completed to "")
    if (
      event.status === "Completed" &&
      !req.user.is_admin &&
      req.body.status &&
      req.body.status !== "Completed"
    ) {
      return res.status(403).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: "Completed events cannot have their status changed.",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event not found.`,
      });
    }

    res.redirect(`/event/manage/${event._id}`);
  } catch (err) {
    console.error("Update event details error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to update event details.`,
    });
  }
};

// @desc     Disable event
// @route    PUT /api/events/disable/:id
// @access   Admin
export const disableEvent = async (req, res) => {
  try {
    let disabled_data = {
      disabled: true,
      disabled_at: new Date(),
      disabled_by: req.user._id,
    };

    const disabledEvent = await Event.findByIdAndUpdate(
      req.params.id,
      disabled_data,
      {
        new: true,
      },
    );

    if (!disabledEvent) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event not found.`,
      });
    }

    res.json(disabledEvent);
  } catch (err) {
    console.error("Disable event error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to disable event.`,
    });
  }
};

// @desc     Delete event
// @route    DELETE /api/events/:id
// @access   Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `Event not found.`,
      });
    } else if (!req.user.is_admin && !event.organizer_id.equals(req.user._id)) {
      return res.status(403).render("error", {
        page_title: "Register | Volunteer Forum",
        logged_in: Boolean(req.user),
        user_id: req.user ? req.user._id : null,
        message: `User does not own this event.`,
      });
    }

    await event.deleteOne();

    res.redirect("/events");
  } catch (err) {
    console.error("Delete event error:", err.message);
    return res.status(500).render("error", {
      page_title: "Register | Volunteer Forum",
      logged_in: Boolean(req.user),
      user_id: req.user ? req.user._id : null,
      message: `Unable to delete event.`,
    });
  }
};

// @desc     Reward all registered users for an event
// @route    POST /api/events/:id/rewardRegisteredUsers
// @access   Admin / Event Organizer
const EVENT_REWARD_POINTS = 10;

export const rewardRegisteredUsers = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Event must be completed before rewarding users." });
    }

    const registrations = await EventRegistration.find({
      event_id: eventId,
      cancelled: false,
      rewarded: false,
    });

    if (registrations.length === 0) {
      return res.json({ message: "No users to reward." });
    }

    for (const reg of registrations) {
      // Update user stats
      await User.findByIdAndUpdate(reg.user_id, {
        $inc: {
          "account_stats.points": EVENT_REWARD_POINTS,
          "account_stats.events_attended_count": 1,
        },
      });

      // Mark registration as rewarded
      reg.rewarded = true;
      await reg.save();
    }

    return res.json({
      message: "Users rewarded successfully.",
      rewarded_count: registrations.length,
    });
  } catch (err) {
    console.error("Reward registered users error:", err);
    res.status(500).json({ message: "Unable to reward users." });
  }
};
