import mongoose from "mongoose";
import logger from "./logger.config.js";

const DB_NAME = "url_shortner";

const connectToMongoDB = async (): Promise<void> => {
  const connectionInstance = await mongoose.connect(
    `${process.env.MONGODB_URI}/${DB_NAME}`
  );

  logger.info({ host: connectionInstance.connection.host }, "MongoDB connected");
};

export default connectToMongoDB;
