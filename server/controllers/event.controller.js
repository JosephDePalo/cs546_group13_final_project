import Event from "../models/event.model.js";

// @desc     Create new event
// @route    POST /api/events
// @access   Private
export const newEvent = async (req, res) => {
  try {
    const { title, start_time, end_time, max_capacity } = req.body;

    const eventExists = await Event.findOne({
      $and: [
        { title },
        { organizer_id: req.user._id },
        { $or: [{ status: "Ongoing" }, { status: "Upcoming" }] },
      ],
    });
    if (eventExists) {
      return res.status(400).json({
        message:
          "You have already created an upcoming or ongoing event with this title.",
      });
    }

    const event = await Event.create({
      organizer_id: req.user._id,
      title,
      start_time,
      end_time,
      max_capacity,
    });

    res.redirect(`/api/v1/events/${event._id}`);
  } catch (err) {
    console.error("New event error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// @desc     Get event
// @route    GET /api/events/:id
// @access   Public

export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(event);
  } catch (err) {
    console.error("Get event error:", err.message);
    res.status(500).json({ message: "Unable to fetch event." });
  }
};

// @desc     Get event
// @route    GET /api/events
// @access   Public

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("Get events error:", err.message);
    res.status(500).json({ message: "Unable to fetch events." });
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
      return res.status(404).json({ message: "Event not found." });
    } else if (!req.user.is_admin && !event.organizer_id.equals(req.user._id)) {
      return res.status(403).json({ message: "User does not own this event." });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.redirect(`/api/v1/events/${event._id}`);
  } catch (err) {
    console.error("Update event details error:", err.message);
    res.status(500).json({ message: "Unable to update event details." });
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
      return res.status(404).json({ message: "Event not found." });
    }

    res.json(disabledEvent);
  } catch (err) {
    console.error("Disable event error:", err.message);
    res.status(500).json({ message: "Unable to disable event." });
  }
};

// @desc     Delete event
// @route    DELETE /api/events/:id
// @access   Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    } else if (!req.user.is_admin && !event.organizer_id.equals(req.user._id)) {
      return res.status(403).json({ message: "User does not own this event." });
    }

    await event.deleteOne();

    res.json(event);
  } catch (err) {
    console.error("Delete event error:", err.message);
    res.status(500).json({ message: "Unable to delete event." });
  }
};
