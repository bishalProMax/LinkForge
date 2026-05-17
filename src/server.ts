import "dotenv/config";
import app from "./app.js";
import "./workers/email.worker.js";
import "./workers/cleanup.worker.js";
import cleanupQueue from "./queues/cleanup.queue.js";
import connectToMongoDB from "./configs/db.config.js";

// schedule cleanup job to run every hour
(async (): Promise<void> => {await cleanupQueue.add("cleanup-unverified-users", {triggeredBy: "cron",}, { jobId: "cleanup-unverified-users", 
      repeat: {every:1000 * 60 * 60 * 1}, 
    });
}
)();

connectToMongoDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    const server = app.listen(PORT, () =>
      console.log(`server is running at port: ${PORT}`)
    );
    
    server.on("error", (error: Error) => {
      console.error("ERROR: ", "our application not able to talk ", error);
    });

  })

  .catch((error: unknown) => {
    console.error("MONGODB connection failed !!! ", error);
    process.exit(1);
  });
