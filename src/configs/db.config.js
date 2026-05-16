/*eslint-disable no-useless-catch */
import mongoose from "mongoose";
import db_name from "./constants.config.js";

async function connectToMongoDB(){
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch (error) {
        throw error
    }
    }

export default connectToMongoDB;