import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const eventRegSchema = new mongoose.Schema(
    {
        user_id: {
            required: [true, "Field: user_id is required and cannot be null"],
            type: ObjectId,
            ref: "Users",
            description: "id of the user registering for an event"
        },
        event_id: {
            required: [true, "Field: event_id is required and cannot be null"],
            type: ObjectId,
            ref: "Events",
            description: "id of the user registering for an event"
        },
        title: {
            type: String,
            required: [true, "Field: title is required and cannot be null"],
            trim: true,
            minlength: [5, "Invalid title length: min 5 chars"],
            maxlength: [50, "Invalid title length: max 50 chars"],
            match: [
                /^[a-zA-Z0-9_-]+$/,
                "Invalid title format: Only letters, numbers, _, and - allowed",
            ],
        description: "Displayed title of an event.",
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: [500, "Invalid description length: max 500 chars"]
        },
        disabled: {
            type: Boolean,
            default: false,
            description: "Can be toggled by admins to hide malicious or reported events (which in turn disables the event regs).",
        },

        disabled_at: {
            type: Date,
            default: null,
            description: "The date that an event/eventreg was disabled.",
        },

        disabled_reason: {
            type: String,
            trim: true,
            default: null,
            description: "The reason that an event/eventreg was disabled.",
        },

        disabled_by: {
            type: ObjectId,
            default: null,
            ref: "Users",
            description: "The user that disabled the event/eventreg",
        },
    },
    {
    timestamps: true,
    },
)

const Report = mongoose.model("EventRegistration", eventRegSchema);
export default Report;