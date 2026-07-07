import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("MONGO_URI is not set. MongoDB connection skipped.");
    return;
  }

  const maxAttempts = 5;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Successfully connected to MongoDB 👍");
      return;
    } catch (error) {
      attempt += 1;
      console.error(`MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);

      if (attempt >= maxAttempts) {
        console.warn("MongoDB is not available yet. The server will continue running and retry in the background.");
        mongoose.connection.on("connected", () => console.log("Successfully connected to MongoDB 👍"));
        mongoose.connection.on("error", (err) => console.error(`MongoDB connection error: ${err.message}`));
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

export default connectDB;
