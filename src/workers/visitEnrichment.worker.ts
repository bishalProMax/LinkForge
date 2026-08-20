import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import { createVisit } from "../modules/url/visit.repository.js";
import { lookupGeoIP } from "../shared/services/geoip.service.js";
import { parseUserAgent } from "../shared/services/uaParser.service.js";
import { isBotTraffic } from "../shared/utils/botDetection.js";
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
      linkId: linkId as unknown as import("mongoose").Types.ObjectId,
      ip,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer,
    });
  },
  {
    connection: redis,
  }
);

visitEnrichmentWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, linkId: job?.data?.linkId, err: error }, "Visit enrichment failed after retries");
});

export default visitEnrichmentWorker;