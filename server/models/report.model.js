import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const reportSchema = new mongoose.Schema(
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
        violation: {
            required: [true, "Field: violation is required and cannot be null"],
            type: String,
            trim: true,
            match: [
                /^[a-zA-Z0-9_-]+$/,
                "Invalid violation format: Only letters, numbers, _, and - allowed",
            ],
            description: "Type of violation the user is reporting",
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
            description: "Can be toggled by admins to disable reports that have been evaluated.",
        },

        disabled_at: {
            type: Date,
            default: null,
            description: "The date that a report was disabled.",
        },

        disabled_reason: {
            type: String,
            trim: true,
            default: null,
            description: "The reason that a report was disabled.",
        },

        disabled_by: {
            type: ObjectId,
            default: null,
            ref: "Users",
            description: "The user that disabled the report",
        },
    },
    {
    timestamps: true,
    },
)

const Report = mongoose.model("Event", reportSchema);
export default Report;