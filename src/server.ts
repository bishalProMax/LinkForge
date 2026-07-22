import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import { Socket } from "net";
import emailWorker from "./workers/email.worker.js";
import cleanupWorker from "./workers/cleanup.worker.js";
import securityEventWorker from "./workers/securityEvent.worker.js";
import cleanupQueue from "./infrastructure/queues/cleanup.queue.js";
import emailQueue from "./infrastructure/queues/email.queue.js";
import securityEventQueue from "./infrastructure/queues/securityEvent.queue.js";
import redis from "./infrastructure/configs/redis.config.js";
import connectToMongoDB from "./infrastructure/configs/db.config.js";
import logger from "./infrastructure/configs/logger.config.js";

let server: ReturnType<typeof app.listen>;
const sockets = new Set<Socket>();

(async (): Promise<void> => {
  await cleanupQueue.add("cleanup-unverified-users", { triggeredBy: "cron" }, { jobId: "cleanup-unverified-users", repeat: { every: 1000 * 60 * 60 } });
})();

connectToMongoDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    server = app.listen(PORT, () => logger.info({ port: PORT }, "Server started "));
    
    server.on("connection", (socket: Socket) => {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    });

    server.on("error", (error: Error) => {
      logger.error({ err: error }, "Server failed to handle a connection");
    });
  })

  .catch((error: unknown) => {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  });

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, "Graceful shutdown initiated");

  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000);

   try {
    if (server) {
      for (const socket of sockets) {
        socket.destroy();
      }
      logger.info({ count: sockets.size }, "Sockets destroyed");

      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info("HTTP server closed");
    }

     await Promise.all([emailWorker.close(), cleanupWorker.close(), securityEventWorker.close()]); 
    logger.info("BullMQ workers closed");

    await Promise.all([emailQueue.close(), cleanupQueue.close(), securityEventQueue.close()]); 
    logger.info("BullMQ queues closed");

    await redis.quit();
    logger.info("Redis disconnected");

    await mongoose.connection.close();
    logger.info("MongoDB connection closed");

    clearTimeout(forceExitTimer);
    logger.info("Graceful shutdown complete");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    logger.error({ err: error }, "Error during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
