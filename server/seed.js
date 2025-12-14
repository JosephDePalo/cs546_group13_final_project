import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";

import User from "./models/user.model.js";
import Event from "./models/event.model.js";
import EventRegistration from "./models/eventreg.model.js";
import Comment from "./models/comments.model.js";
import Friendship from "./models/friendship.model.js";
import Report from "./models/report.model.js";

dotenv.config();

const TOTAL_USERS = 15;
const TOTAL_EVENTS = 8;
const MAX_FRIENDS_PER_USER = 3;
const COMMENTS_PER_EVENT = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` DB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(` DB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomSubset = (arr, max) => {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * max) + 1);
};

const seedData = async () => {
  try {
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      EventRegistration.deleteMany({}),
      Comment.deleteMany({}),
      Friendship.deleteMany({}),
      Report.deleteMany({}),
    ]);

    const createdUsers = [];

    const adminUser = new User({
      username: "admin_user",
      email: "admin@example.com",
      password_hash: "Test123!",
      first_name: "Admin",
      last_name: "User",
      gender: "Female",
      city: "New York",
      state: "NY",
      age: 30,
      is_admin: true,
      is_active: true,
    });
    await adminUser.save();
    const normalUser = new User({
      username: "normal_user",
      email: "normal_user@example.com",
      password_hash: "Test123!",
      first_name: "Normal",
      last_name: "User",
      gender: "Male",
      city: "Hoboken",
      state: "NJ",
      age: 20,
      is_admin: false,
      is_active: true,
    });
    await normalUser.save();
    createdUsers.push(normalUser);

    for (let i = 0; i < TOTAL_USERS - 1; i++) {
      const sex = faker.person.sexType();
      const firstName = faker.person.firstName(sex);
      const lastName = faker.person.lastName();

      const user = new User({
        username:
          faker.internet
            .username({ firstName, lastName })
            .replace(/[^a-zA-Z0-9_]/g, "") + `_${i}`,
        email: faker.internet.email({ firstName, lastName }),
        password_hash: "Test123!",
        first_name: firstName,
        last_name: lastName,
        gender: sex.charAt(0).toUpperCase() + sex.slice(1),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        age: faker.number.int({ min: 16, max: 80 }),
      });
      await user.save();
      createdUsers.push(user);
    }

    const createdEvents = [];

    for (let i = 0; i < TOTAL_EVENTS; i++) {
      const organizer = getRandom(createdUsers);
      const startTime = faker.date.future();
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const event = new Event({
        organizer_id: organizer._id,
        title: faker.lorem
          .words(3)
          .substring(0, 50)
          .replace(/[^a-zA-Z0-9 ]/g, ""),
        description: faker.lorem.paragraph(),
        location_url: faker.internet.url(),
        start_time: startTime,
        end_time: endTime,
        max_capacity: faker.number.int({ min: 20, max: 200 }),
        status: "Upcoming",
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
      });

      await event.save();
      createdEvents.push(event);

      await User.findByIdAndUpdate(organizer._id, {
        $inc: { "account_stats.events_organized": 1 },
      });
    }

    for (const event of createdEvents) {
      const potentialAttendees = createdUsers.filter(
        (u) => u._id.toString() !== event.organizer_id.toString(),
      );
      const attendees = getRandomSubset(potentialAttendees, 10);

      for (const attendee of attendees) {
        await EventRegistration.create({
          user_id: attendee._id,
          event_id: event._id,
        });

        await Event.findByIdAndUpdate(event._id, {
          $inc: { "stats.registrations_count": 1 },
        });
        await User.findByIdAndUpdate(attendee._id, {
          $inc: {
            "account_stats.events_attended_count": 1,
            "account_stats.points": 100,
          },
        });
      }
    }

    for (const user of createdUsers) {
      const potentialFriends = createdUsers.filter(
        (u) => u._id.toString() !== user._id.toString(),
      );
      const friends = getRandomSubset(potentialFriends, MAX_FRIENDS_PER_USER);

      for (const friend of friends) {
        const exists = await Friendship.exists(user._id, friend._id);
        if (!exists) {
          await Friendship.create({
            user_id: user._id,
            friend_id: friend._id,
            status: "accepted",
          });

          await User.findByIdAndUpdate(user._id, {
            $inc: { "account_stats.friends_count": 1 },
          });
          await User.findByIdAndUpdate(friend._id, {
            $inc: { "account_stats.friends_count": 1 },
          });
        }
      }
    }

    for (const event of createdEvents) {
      for (let i = 0; i < COMMENTS_PER_EVENT; i++) {
        const author = getRandom(createdUsers);
        const comment = await Comment.create({
          user_id: author._id,
          event_id: event._id,
          content: faker.lorem.sentence(),
        });

        await Event.findByIdAndUpdate(event._id, {
          $inc: { "stats.comments_count": 1 },
        });
        await User.findByIdAndUpdate(author._id, {
          $inc: { "account_stats.comments_count": 1 },
        });

        if (Math.random() > 0.7) {
          const replier = getRandom(createdUsers);
          await Comment.create({
            user_id: replier._id,
            event_id: event._id,
            content: faker.lorem.sentence(),
            parent_comment_id: comment._id,
            reply_depth: 1,
          });
          await Event.findByIdAndUpdate(event._id, {
            $inc: { "stats.comments_count": 1 },
          });
          await User.findByIdAndUpdate(replier._id, {
            $inc: { "account_stats.comments_count": 1 },
          });
        }
      }
    }

    const eventToReport = getRandom(createdEvents);
    const reporter1 = getRandom(createdUsers);

    await Report.create({
      reporter_id: reporter1._id,
      target_type: "event",
      target_id: eventToReport._id,
      reason: "Inappropriate title",
      description: "The title for this event is very inappropriate",
      severity: "Medium",
    });

    const userToReport = getRandom(createdUsers);
    const reporter2 = getRandom(createdUsers);

    if (userToReport._id !== reporter2._id) {
      await Report.create({
        reporter_id: reporter2._id,
        target_type: "user",
        target_id: userToReport._id,
        reason: "Inappropriate comments",
        description: "User is posting many inappropriate comments",
        severity: "High",
      });
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

await connectDB();
await seedData();
process.exit(0);
