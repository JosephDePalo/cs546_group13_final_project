import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const accountStatsSchema = new mongoose.Schema(
  {
    points: {
      type: Number,
      default: 0,
      description: "Points awarded for attending events.",
    },
    rank: {
      type: String,
      default: "Bronze",
      description: "Awarded to users based on a point system.",
    },
    events_attended_count: {
      type: Number,
      default: 0,
      description:
        "Derived: Count(EventRegistrations) — number of events a user attended.",
    },
    events_organized: {
      type: Number,
      default: 0,
      description:
        "Derived: Count(Events) — number of events a user has organized.",
    },
    friends_count: {
      type: Number,
      default: 0,
      description:
        "Derived: Count(Friendships) — number of friends a user has.",
    },
    comments_count: {
      type: Number,
      default: 0,
      description:
        "Derived: Count(Comments) — number of comments made by the user.",
    },
  },
  {
    timestamps: true,
  },
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Field: username is required and cannot be null"],
      unique: true,
      trim: true,
      minlength: [3, "Invalid username length: min 3 chars"],
      maxlength: [30, "Invalid username length: max 30 chars"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Invalid username format: only letters, numbers, and _ allowed",
      ],
      description: "Display and login name chosen by the user; must be unique.",
    },
    email: {
      type: String,
      required: [true, "Field: email is required and cannot be null"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, "Invalid email length: max 100 chars"],
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      description:
        "Email address of the user, used for communication and authentication purposes.",
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[0-9]{10}$/, "Invalid phone number: must be 10 digits"],
      description:
        "Optional phone number for communication/verification purposes.",
    },
    first_name: {
      type: String,
      trim: true,
      maxlength: [50, "Invalid first_name length: max 50 chars"],
      description: "User’s first name.",
    },
    last_name: {
      type: String,
      trim: true,
      maxlength: [50, "Invalid last_name length: max 50 chars"],
      description: "User’s last name.",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", null],
      default: null,
      description: "User’s gender.",
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, "Invalid city length: max 50 chars"],
      description: "City of residency.",
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, "Invalid state length: max 50 chars"],
      description: "State of residency.",
    },
    age: {
      type: Number,
      min: [13, "Invalid age: cannot be negative"],
      max: [120, "Invalid age: max 120"],
      description: "User’s age.",
    },
    password_hash: {
      type: String,
      required: [true, "Field: password_hash is required and cannot be null"],
      description: "Hashed password used for authentication.",
      validate: {
        validator: function (value) {
          if (!this.isModified("password_hash")) return true;

          if (typeof value !== "string") return false;
          if (value.length < 8) return false;
          if (!/[A-Z]/.test(value)) return false;
          if (!/[0-9]/.test(value)) return false;
          if (!/[!@#$%^&*]/.test(value)) return false;

          return true;
        },
        message:
          "Invalid password: must have be at least 8 characters long and have a capital letter, number, and special character",
      },
    },
    otp: {
      type: String,
      default: null,
      maxlength: [6, "Invalid otp length: max 6 chars"],
      description: "OTP used to verify email address.",
    },
    profile_picture_url: {
      type: String,
      default: null,
      maxlength: [300, "Invalid profile_picture_url length: max 300 chars"],
      description: "User's profile photo URL.",
    },
    account_stats: {
      type: accountStatsSchema,
      default: {},
      description:
        "Aggregated statistics that represent user's engagement on the platform.",
    },
    is_admin: {
      type: Boolean,
      default: false,
      description:
        "Indicates if the user has admin privileges for moderation and platform control.",
    },
    is_active: {
      type: Boolean,
      default: true,
      description:
        "Can be toggled by admins to deactivate malicious or reported accounts.",
    },
  },
  // timestamps: created_at and updated_at
  {
    timestamps: true,
  },
);

// compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password_hash);
};

// hash before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

userSchema.statics.getTopUsers = function (limit = 10) {
  return this.find({
    is_active: true,
  })
    .sort({ "account_stats.points": -1 })
    .limit(limit)
    .select("-password_hash -otp")
    .lean();
};

const User = mongoose.model("User", userSchema);
export default User;
