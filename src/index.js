require("dotenv").config();
const app = require("./app.js");
require("./workers/email.worker.js");
require("./workers/cleanup.worker.js");
const cleanupQueue = require("./queues/cleanup.queue.js");
const { connectToMongoDB } = require("./config/db.js");

// schedule cleanup job to run every hour
(async () => {await cleanupQueue.add("cleanup-unverified-users", {}, { jobId: "cleanup-unverified-users", 
      repeat: {every:1000 * 60 * 60 * 1}, 
    });
}
)();

connectToMongoDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR: ", "our application not able to talk ", error);
    });
    app.listen(process.env.PORT || 8000, () =>
      console.log(`server is running at port: ${process.env.PORT}`)
    );
  })

  .catch((err) => {
    console.log("MONGODB connection failed !!! ", err);
    process.exit(1);
  });
