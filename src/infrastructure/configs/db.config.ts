import mongoose from "mongoose";

const DB_NAME = "url_shortner";

const connectToMongoDB = async (): Promise<void> => {
  const connectionInstance = await mongoose.connect(
    `${process.env.MONGODB_URI}/${DB_NAME}`
  );

  console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
};

export default connectToMongoDB;
