import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log("Server is starting...");
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`MongoDB connected → host: ${connectionInstance.connection.host}, db: ${connectionInstance.connection.name}`);

  } catch (error) {
    console.log('MongoDB connection error ', error);
    process.exit(1);
  }
}

export default connectDB;