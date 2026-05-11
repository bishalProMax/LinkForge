/*eslint-disable no-useless-catch */
const mongoose = require("mongoose")
const db_name = require("../constants.js")

async function connectToMongoDB(){
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch (error) {
        throw error
    }
    }

module.exports = { connectToMongoDB}