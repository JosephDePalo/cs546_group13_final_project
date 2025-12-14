import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const reportSchema = new mongoose.Schema(
  {
    reporter_id: {
      required: [true, "Field: reporter_id is required and cannot be null"],
      type: ObjectId,
      ref: "User",
      description: "id of the user reporting the event",
    },
    target_type: {
      required: [true, "Field: target_type is required and cannot be null"],
      type: String,
      trim: true,
      enum: ["event", "comment", "user"],
      description: "The type of thing being reported",
    },
    target_id: {
      required: [true, "Field: target_id is required and cannot be null"],
      type: ObjectId,
      description: "id of the event/comment/user being reported",
    },
    reason: {
      required: [true, "Field: reason is required and cannot be null"],
      type: String,
      trim: true,
      maxlength: [50, "Invalid description length: max 50 chars"],
      description: "Reason for why the report is being made",
    },
    description: {
      type: String,
      required: [true, "Field: description is required and cannot be null"],
      trim: true,
      maxlength: [500, "Invalid description length: max 500 chars"],
      description: "Detailed explanation provided by the reporter",
    },

    severity: {
      required: [true, "Field: severity is required and cannot be null"],
      type: String,
      trim: true,
      enum: ["High", "Medium", "Low"],
      description: "High | Medium | Low",
    },

    resolution_status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "dismissed"],
      description: "pending, reviewed, dismissed",
    },

    responding_admin_id: {
      type: ObjectId,
      default: null,
      ref: "User",
      description: "id of the admin who handled the report",
    },

    responding_admin_notes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, "Invalid description length: max 500 chars"],
      description: "Additional notes from admin",
    },

    resolution_decision: {
      type: String,
      default: null,
      enum: ["warned", "resolved", "target_redacted"],
      description: "The resultant decision for the report",
    },

    resolved_at: {
      type: Date,
      default: null,
      description: "Timestamp of when the report was marked as resolved",
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index(
  { reporter_id: 1, target_type: 1, target_id: 1 },
  { unique: true },
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
