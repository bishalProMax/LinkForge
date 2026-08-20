import { getGeoIPReader } from "../../infrastructure/configs/geoip.config.js";

export interface GeoLookupResult {
  country?: string;
  region?: string;
  city?: string;
}

const lookupGeoIP = (ip: string): GeoLookupResult => {
  try {
    const reader = getGeoIPReader();
    const result = reader.get(ip);

    if (!result) {
      return {};
    }

    return {
      country: result.country?.names?.en,
      region: result.subdivisions?.[0]?.names?.en,
      city: result.city?.names?.en,
    };
  } catch {
    return {};
  }
};

export { lookupGeoIP };
