// src/scripts/backfillTitles.ts
import "dotenv/config";
import mongoose from "mongoose";
import URL from "../models/url.model.js";
import { getDefaultTitle } from "../shared/utils/defaultTitle.js";
import connectToMongoDB from "../infrastructure/configs/db.config.js";
import logger from "../infrastructure/configs/logger.config.js";

const backfillTitles = async (): Promise<void> => {
  await connectToMongoDB();

  const untitledUrls = await URL.find({
    $or: [{ title: { $exists: false } }, { title: null }, { title: "" }],
  });

  logger.info({ count: untitledUrls.length }, "Backfilling titles for existing links");

  let updated = 0;

  for (const url of untitledUrls) {
    url.title = getDefaultTitle(url.redirectURL);
    await url.save();
    updated++;
  }

  logger.info({ updated }, "Title backfill complete");
  await mongoose.connection.close();
  process.exit(0);
};

backfillTitles().catch((error) => {
  logger.error({ err: error }, "Title backfill failed");
  process.exit(1);
});