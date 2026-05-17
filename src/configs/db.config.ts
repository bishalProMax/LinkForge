import mongoose from "mongoose";
import db_name from "./constants.config.js";

const connectToMongoDB = async (): Promise<void> => {
  const connectionInstance = await mongoose.connect(
    `${process.env.MONGODB_URI}/${db_name}`
  );

  console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
};

export default connectToMongoDB;
