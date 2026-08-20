import { UAParser } from "ua-parser-js";

interface ParsedUserAgent {
  browser?: string;
  os?: string;
  device: string;
}

const parseUserAgent = (userAgent: string): ParsedUserAgent => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name,
    os: result.os.name,
    device: result.device.type ?? "desktop",
  };
};

export { parseUserAgent };
export type { ParsedUserAgent };