require("dotenv").config()
const app = require("./app.js")
const redis = require("./config/redis.js");

const { connectToMongoDB} = require("./config/db.js")

connectToMongoDB()
.then(() => {
    app.on("error", (error) => {
            console.log("ERROR: ", "our application not able to talk ", error );
            
        })
    app.listen(process.env.PORT || 8000,() => console.log(`server is running at port: ${process.env.PORT}`))
})

.catch((err) => {
    console.log("MONGODB connection failed !!! ", err)
    process.exit(1)
})
