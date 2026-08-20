import maxmind, { type Reader, type CityResponse } from "maxmind";
import logger from "./logger.config.js";

let reader: Reader<CityResponse> | null = null;

const loadGeoIPReader = async (): Promise<void> => {
  const dbPath = process.env.GEOLITE2_DB_PATH;

  if (!dbPath) {
    throw new Error("GEOLITE2_DB_PATH is not set. The MaxMind GeoLite2 database path is required to start the app.");
  }

  reader = await maxmind.open<CityResponse>(dbPath);

  logger.info({ dbPath }, "MaxMind GeoLite2 database loaded");
};

const getGeoIPReader = (): Reader<CityResponse> => {
  if (!reader) {
    throw new Error("MaxMind GeoLite2 database not loaded. loadGeoIPReader() must run before this is called.");
  }

  return reader;
};

export { loadGeoIPReader, getGeoIPReader };