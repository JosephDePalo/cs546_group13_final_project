import Event from "../models/event.model.js";
import EventRegistration from "../models/eventreg.model.js";

export const newEventRegistration = async (req, res) => {
  try {
    const event_id = req.params.id;
    const user_id = req.user._id;

    const event = await Event.findById(event_id);

    if (!event) {
      return res.sendStatus(404);
    }

    //check capacity
    if (event.registrations_count >= event.max_capacity) {
      // event full
      return res.sendStatus(409);
    }

    const existing = await EventRegistration.findOne({
      user_id,
      event_id,
    });

    if (existing) {
      if (!existing.cancelled) {
        // already registered
        return res.sendStatus(409);
      }

      // re-register
      existing.cancelled = false;
      existing.cancelled_at = null;
      existing.registered_at = new Date();
      await existing.save();

      event.registrations_count += 1;
      await event.save();

      return res.sendStatus(200);
    }

    // first-time registration
    await EventRegistration.create({
      user_id,
      event_id,
      registered_at: new Date(),
    });

    // Increaase registration count
    event.registrations_count += 1;
    await event.save();

    return res.sendStatus(201);
  } catch (err) {
    console.error("New event registration error:", err);
    return res.sendStatus(500);
  }
};

// @desc     Get EventRegistration
// @access   Public

export const getEventRegistration = async (req, res) => {
  try {
    const eventReg = await EventRegistration.findById(req.params.id);

    if (!eventReg) {
      return res.status(404).json({ message: "Event registration not found." });
    }

    res.json(eventReg);
  } catch (err) {
    console.error("Get event registration error:", err.message);
    res.status(500).json({ message: "Unable to fetch event registration." });
  }
};

// @desc     Get EventRegistration
// @access   Public

export const getAllEventRegistrations = async (req, res) => {
  try {
    const eventRegs = await EventRegistration.find();
    res.json(eventRegs);
  } catch (err) {
    console.error("Get all event registrations error:", err.message);
    res.status(500).json({ message: "Unable to fetch event registrations." });
  }
};

// @desc     Update EventRegistration

export const updateEventRegistration = async (req, res) => {
  try {
    let new_eventReg = req.body;

    delete new_eventReg._id;

    const eventReg = await EventRegistration.findById(req.params.id);
    if (!eventReg) {
      return res.status(404).json({ message: "Event registration not found." });
    }

    const updatedEventReg = await EventRegistration.findByIdAndUpdate(
      req.params.id,
      new_eventReg,
      {
        new: true,
      },
    );

    if (!updatedEventReg) {
      return res.status(404).json({ message: "Event registration not found." });
    }

    res.json(updatedEventReg);
  } catch (err) {
    console.error("Update event registration error:", err.message);
    res.status(500).json({ message: "Unable to update event registration." });
  }
};

// @desc     Delete EventRegistration

export const deleteEventReg = async (req, res) => {
  try {
    const eventReg = await EventRegistration.findById(req.params.id);

    if (!eventReg) {
      return res.status(404).json({ message: "EventRegistration not found." });
    }

    await eventReg.deleteOne();

    res.json(eventReg);
  } catch (err) {
    console.error("Delete EventRegistration error:", err.message);
    res.status(500).json({ message: "Unable to delete EventRegistration" });
  }
};

// @desc     Cancel EventRegistration

export const cancelEventReg = async (req, res) => {
  try {
    const event_id = req.params.id;
    const user_id = req.user._id;

    const eventReg = await EventRegistration.findOne({
      user_id,
      event_id,
      cancelled: false,
    });

    if (!eventReg) {
      return res.sendStatus(404);
    }

    eventReg.cancelled = true;
    eventReg.cancelled_at = new Date();
    await eventReg.save();

    // decrease registrations_count
    await Event.findByIdAndUpdate(event_id, {
      $inc: { registrations_count: -1 },
    });

    return res.sendStatus(204);
  } catch (err) {
    console.error("Cancel event registration error:", err);
    res.sendStatus(500);
  }
};
