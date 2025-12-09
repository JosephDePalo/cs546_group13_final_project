import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const reportSchema = new mongoose.Schema(
    {
        reporter_id: {
            required: [true, "Field: reporter_id is required and cannot be null"],
            type: ObjectId,
            ref: "Users",
            description: "id of the user reporting the event"
        },
        target_type: {
            required: [true, "Field: target_type is required and cannot be null"],
            type: String,
            trim: true,
            description: "event | comment| user"
        },
        target_id: {
            required: [true, "Field: target_id is required and cannot be null"],
            type: ObjectId,
            ref: "Events",
            description: "id of the event being reported"
        },
        reason: {
            required: [true, "Field: reason is required and cannot be null"],
            type: String,
            trim: true,
            maxlength: [50, "Invalid description length: max 50 chars"],
            description: "Reason for why the report is being made"
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: [500, "Invalid description length: max 500 chars"],
            description: "Detailed explanation provided by the reporter"
        },
        severity: {
            required: [true, "Field: severity is required and cannot be null"],
            type: String,
            trim: true,
            description: "High | Medium | Low"
        },

        resolution_status: {
            type: String,
            default: "pending",
            description: "Pending, reviewed, dismissed"
        },

        responding_admin_id: {
            type: ObjectId,
            default: null,
            ref: "Users",
            description: "id of the admin who handled the report"
        },

        reponding_admin_notes: {
            type: String,
            default: null,
            trim: true,
            maxlength: [500, "Invalid description length: max 500 chars"],
            description: "Additional notes from admin"
        },

        resolution_decision: {
            type: String,
            default: null,
            description: "Warned | Resolved || targed_redacted "
        },
        
        resolved_at: {
            type: Date,
            default: null,
            description: "Timestamp of when the report was marked as resolved."
        },

        created_at: {
            type: Date,
            default: null,
            description: "Timestamp of when the report was created."
        },

        updated_at: {
            type: Date,
            default: null,
            description: "Timestamp of when the report was updated."
        }
    },
    {
    timestamps: true,
    },
)

const Report = mongoose.model("Report", reportSchema);
export default Report;
