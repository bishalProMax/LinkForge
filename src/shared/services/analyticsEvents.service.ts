import { EventEmitter } from "events";
import redis from "../../infrastructure/configs/redis.config.js";
import redisSubscriber from "../../infrastructure/configs/redisSubscriber.config.js";
import logger from "../../infrastructure/configs/logger.config.js";

export interface AnalyticsEvent {
  type: "url" | "qr";
  itemId: string;   
  ownerId: string;  
}

const ANALYTICS_EVENTS_CHANNEL = "analytics:events";

const analyticsEventBus = new EventEmitter();
// many concurrent SSE connections may listen at once, Node's EventEmitter has a default warning threshold of 10 listeners.
analyticsEventBus.setMaxListeners(0);

const publishAnalyticsEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    await redis.publish(ANALYTICS_EVENTS_CHANNEL, JSON.stringify(event));
  } catch (error) {
    logger.error({ err: error }, "Failed to publish analytics event");
  }
};

redisSubscriber.subscribe(ANALYTICS_EVENTS_CHANNEL)
.catch((error) => {
  logger.error({ err: error }, "Failed to subscribe to analytics events channel");
});

redisSubscriber.on("message", (channel, message) => {
  if (channel !== ANALYTICS_EVENTS_CHANNEL) return;

  try {
    const event = JSON.parse(message) as AnalyticsEvent;
    analyticsEventBus.emit("event", event); //sent to all listeners in that instance
  } catch (error) {
    logger.error({ err: error }, "Failed to parse analytics event message");
  }
});

export { 
  publishAnalyticsEvent, 
  analyticsEventBus 
  };