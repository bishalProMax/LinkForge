import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import redis from "../infrastructure/configs/redis.config.js";
import { createVisit } from "../modules/url/visit.repository.js";
import URL from "../models/url.model.js";
import { lookupGeoIP } from "../shared/services/geoip.service.js";
import { parseUserAgent } from "../shared/services/uaParser.service.js";
import { isBotTraffic } from "../shared/utils/botDetection.js";
import { publishAnalyticsEvent } from "../shared/services/analyticsEvents.service.js";
import type { VisitEnrichmentJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const visitEnrichmentWorker = new Worker<VisitEnrichmentJob>("visitEnrichmentQueue", async (job: Job<VisitEnrichmentJob>): Promise<void> => {
    const { linkId, ip, userAgent, referrer } = job.data;

    if (isBotTraffic(userAgent)) {
      logger.info({ linkId }, "Bot traffic detected on click, visit discarded");
      return;
    }

    const geo = lookupGeoIP(ip);
    const ua = parseUserAgent(userAgent ?? "");

    await createVisit({
      linkId: linkId as unknown as mongoose.Types.ObjectId,
      ip,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer,
    });

    // as soon as user clicks, analytics are written in db and also published in redis for live SSE connections
    try {
      const url = await URL.findById(linkId).select("createdBy").lean();
      if (url) {
        await publishAnalyticsEvent({ type: "url", itemId: linkId, ownerId: url.createdBy.toString() });
      }
    } catch (error) {
      logger.error({ err: error, linkId }, "Failed to publish real-time analytics event for visit");
    }
  },
  {
    connection: redis,
  }
);

visitEnrichmentWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, linkId: job?.data?.linkId, err: error }, "Visit enrichment failed after retries");
});

export default visitEnrichmentWorker;