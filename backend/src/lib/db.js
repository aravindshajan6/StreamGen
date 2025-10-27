import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI; // moved inside
  console.log("Loaded MONGO_URI:", MONGO_URI);

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB --");
    console.error(error);
    process.exit(1);
  }
};
