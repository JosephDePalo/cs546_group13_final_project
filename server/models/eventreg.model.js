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
        registered_at: {
            type: Date,
            default: Date.now,
            description: "Timestamp of registration."
        },
        attended: {
            type: Boolean,
            default: false,
            description: "T/F if attended or not"
        },
        checkin_time: {
            type: Date,
            default: null,
            description: "Timestamp of check in."
        },

        cancelled: {
            type: Boolean,
            default: false,
            description: "T/F if cancelled or not"
        },

        cancelled_at: {
            type: Date,
            default: null,
            description: "Timestamp of cancellation."
        }
    },
    {
    timestamps: true,
    },
)

eventRegSchema.index(
    {user_id: 1, event_id: 1},
    {unique: true}
);

const EventRegistration = mongoose.model("EventRegistration", eventRegSchema);
export default EventRegistration;

