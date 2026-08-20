import { Worker, Job } from "bullmq";
import redis from "../infrastructure/configs/redis.config.js";
import { createQRScan } from "../modules/qr/qrScan.repository.js";
import { lookupGeoIP } from "../shared/services/geoip.service.js";
import { parseUserAgent } from "../shared/services/uaParser.service.js";
import { isBotTraffic } from "../shared/utils/botDetection.js";
import type { QRScanEnrichmentJob } from "../shared/types/queue.types.js";
import logger from "../infrastructure/configs/logger.config.js";

const qrScanEnrichmentWorker = new Worker<QRScanEnrichmentJob>("qrScanEnrichmentQueue", async (job: Job<QRScanEnrichmentJob>): Promise<void> => {
    const { qrId, ip, userAgent, referrer } = job.data;

    if (isBotTraffic(userAgent)) {
      logger.info({ qrId }, "Bot traffic detected on scan, scan discarded");
      return;
    }

    const geo = lookupGeoIP(ip);
    const ua = parseUserAgent(userAgent ?? "");

    await createQRScan({
      qrId: qrId as unknown as import("mongoose").Types.ObjectId,
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

qrScanEnrichmentWorker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, qrId: job?.data?.qrId, err: error }, "QR scan enrichment failed after retries");
});

export default qrScanEnrichmentWorker;