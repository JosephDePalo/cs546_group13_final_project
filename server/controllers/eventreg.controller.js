import EventRegistration from "../models/eventreg.model.js";

// @desc     Create new EventRegistration
// @access   Private

export const newEventRegistation = async (req, res) => {
    try {
        const {user_id, event_id, title, description} = req.body;
        const existingEventReg = await EventRegistration.findOne({title});
    if (existingEventReg) {
      return res.status(400).json({
        message:
          "An event registration already exists for this title.",
      });
    }
        const eventReg = await EventRegistration.create({
            user_id,
            event_id,
            title,
            description
        });

        res.json(eventReg);
    } catch (err) {
        console.error("New event registration error:", err.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

// @desc     Get reports
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

// @desc     Get report
// @access   Public

export const getAllEventRegistrations = async (req, res) => {
  try {
    const eventRegs = await Report.find();
    res.json(eventRegs);
  } catch (err) {
    console.error("Get all event registrations error:", err.message);
    res.status(500).json({ message: "Unable to fetch event registrations." });
  }
}


// @desc     Update report 
// @access   Private/Admin

export const updateEventRegistration = async (req, res) => {
    try {
        let new_eventReg = req.body;

        delete new_eventReg._id;
        delete new_eventReg.disabled;
        delete new_eventReg.disabled_at;
        delete new_eventReg.disabled_by;

        const eventReg = await EventRegistration.findById(req.params.id);
        if (!eventReg) {
            return res.status(404).json({ message: "Event registration not found." });
        }

        const updatedEventReg = await EventRegistration.findByIdAndUpdate(req.params.id, new_eventReg, {
            new: true,
        });

        if (!updatedEventReg) {
            return res.status(404).json({ message: "Event registration not found." });
        }

        res.json(updatedEventReg);
    } catch (err) {
        console.error("Update event registration error:", err.message)
        res.status(500).json({ message: "Unable to update event registration." });
    }
}