import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const eventStatsSchema = new mongoose.Schema(
  {
    registrations_count: {
      type: Number,
      default: 0,
      validate: {
        validator: function (n) {
          return Number.isInteger(n);
        },
        message: "Invalid registrations_count: Must be an integer",
      },
      description: "The number of people currently registered for an event.",
    },

    checked_in_count: {
      type: Number,
      default: 0,
      validate: {
        validator: function (n) {
          return Number.isInteger(n);
        },
        message: "Invalid checked_in_count: Must be an integer",
      },
      description: "The number of people currently registered for an event.",
    },

    comments_count: {
      type: Number,
      default: 0,
      validate: {
        validator: function (n) {
          return Number.isInteger(n);
        },
        message: "Invalid comments_count: Must be an integer",
      },
      description: "The number of people currently registered for an event.",
    },

    stats: {
      type: eventStatsSchema,
      default: {},
      description:
        "Aggregated statistics representing event attendance and engagement.",
    },
  },
  {
    timestamps: true,
  },
);

const eventSchema = new mongoose.Schema(
  {
    organizer_id: {
      type: ObjectId,
      ref: "Users",
      description: "ID of the event organizer.",
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
      maxlength: [500, "Invalid description length: max 500 chars"],
      description: "Description of the event",
    },

    location_url: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: [500, "Invalid location_url length: max 500 chars"],
      match: [
        /.*/,
        "Invalid location_url: Please provide a valid HTTP/HTTPS URL",
      ],
      description:
        "A URL pointing to a website with relevant information about the event's location.",
    },

    start_time: {
      type: Date,
      required: [true, "Field: start_time is required and cannot be null"],
      validate: {
        validator: function (dt) {
          return dt > new Date();
        },
        message: "Invalid start_time: Must be in the future",
      },
      description: "The time and date that the event will start.",
    },

    end_time: {
      type: Date,
      required: [true, "Field: end_time is required and cannot be null"],
      validate: {
        validator: function (dt) {
          if (this.start_time) {
            return false;
          }

          // 30 minutes in milliseconds
          const thirty_minutes = 1800000;

          return dt >= this.start_time + thirty_minutes;
        },
        message:
          "Invalid end_time: Must be at least 30 minutes after start_time",
      },
      description: "The time and date that the event will end.",
    },

    max_capacity: {
      type: Number,
      required: [true, "Field: max_capacity is required and cannot be null"],
      min: [1, "Invalid max_capacity size: min 1"],
      max: [200, "Invalid max_capacity size: max 200"],
      validate: {
        validator: function (n) {
          return Number.isInteger(n);
        },
        message: "Invalid max_capacity: Must be an integer",
      },
      description:
        "The maximum number of people that can volunteer for the event.",
    },

    status: {
      type: String,
      trim: true,
      required: true,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
      description: "The status of the event.",
    },

    disabled: {
      type: Boolean,
      default: false,
      description:
        "Can be toggled by admins to hide malicious or reported events.",
    },

    disabled_at: {
      type: Date,
      default: null,
      description: "The date that an event was disabled.",
    },

    disabled_reason: {
      type: String,
      trim: true,
      default: null,
      description: "The reason that an event was disabled.",
    },

    disabled_by: {
      type: ObjectId,
      default: null,
      ref: "Users",
      description: "The user that disabled the event",
    },

    address: {
      type: String,
      trim: true,
      default: null,
      description: "The address where the event is taking place.",
    },

    city: {
      type: String,
      trim: true,
      default: null,
      description: "The city where the event is taking place.",
    },

    state: {
      type: String,
      trim: true,
      default: null,
      description: "The state where the event is taking place.",
    },

    tags: {
      type: [String],
      default: [],
      trim: true,
      lowercase: true,
      description: "Tags for the event to be used for searching and filtering.",
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
