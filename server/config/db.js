import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(` DB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(` DB Connection Error: ${err.message}`);

    // Exit only in production environments
    if (process.env.MODE !== "DEVELOPMENT") process.exit(1);
  }
};

export default connectDB;
