import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { Socket } from "net";
import emailWorker from "./workers/email.worker.js";
import cleanupWorker from "./workers/cleanup.worker.js";
import cleanupQueue from "./infrastructure/queues/cleanup.queue.js";
import emailQueue from "./infrastructure/queues/email.queue.js";
import redis from "./infrastructure/configs/redis.config.js";
import connectToMongoDB from "./infrastructure/configs/db.config.js";

let server: ReturnType<typeof app.listen>;
const sockets = new Set<Socket>();

(async (): Promise<void> => {
  await cleanupQueue.add("cleanup-unverified-users", { triggeredBy: "cron" }, { jobId: "cleanup-unverified-users", repeat: { every: 1000 * 60 * 60 } });
})();

connectToMongoDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    server = app.listen(PORT, () => console.log(`server is running at port: ${PORT}`));
    
    server.on("connection", (socket: Socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });

    server.on("error", (error: Error) => {
      console.error("ERROR: ", "our application not able to talk ", error);
    });
  })

  .catch((error: unknown) => {
    console.error("MONGODB connection failed !!! ", error);
    process.exit(1);
  });

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000);

  try {
    console.log("Step 1: closing sockets...");
    if (server) {
      for (const socket of sockets) {
        socket.destroy();
      }
      console.log(`Destroyed ${sockets.size} sockets.`);

      console.log("Step 2: closing HTTP server...");
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      console.log("HTTP server closed.");
    }

    console.log("Step 3: closing BullMQ workers...");
    await Promise.all([emailWorker.close(), cleanupWorker.close()]);
    console.log("BullMQ workers drained and closed.");

    console.log("Step 4: closing BullMQ queues...");
    await Promise.all([emailQueue.close(), cleanupQueue.close()]);
    console.log("BullMQ queues closed.");

    console.log("Step 5: quitting Redis...");
    await redis.quit();
    console.log("Redis disconnected.");

    console.log("Step 6: closing MongoDB...");
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    clearTimeout(forceExitTimer);
    console.log("Graceful shutdown complete.");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
