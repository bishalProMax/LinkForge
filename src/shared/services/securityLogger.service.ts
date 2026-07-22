import logger from "../../infrastructure/configs/logger.config.js";
import securityEventQueue from "../../infrastructure/queues/securityEvent.queue.js";
import type { SecurityEventPayload } from "../types/securityEvent.types.js"


const securityLogger = logger.child({ context: "security" });

const logSecurityEvent = (payload: SecurityEventPayload, level: "info" | "warn" | "error" = "warn"): void => {
  securityLogger[level](payload, `security_event: ${payload.event}`);

  securityEventQueue.add("persist-security-event", {
      event: payload.event,
      email: payload.email,
      userId: payload.userId,
      ip: payload.ip,
      metadata: payload,
    })
    .catch((error) => {
      securityLogger.error({ err: error }, "Failed to enqueue security event");
    });
};

export { logSecurityEvent };