import "dotenv/config";
import app from "./app.js";
import "./workers/email.worker.js";
import "./workers/cleanup.worker.js";
import cleanupQueue from "./queues/cleanup.queue.js";
import connectToMongoDB from "./config/db.js";

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
