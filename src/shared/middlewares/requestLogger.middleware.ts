import { pinoHttp } from "pino-http";
import { randomUUID } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";
import logger from "../../infrastructure/configs/logger.config.js";

const requestLogger = pinoHttp({
  logger,

  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    const existingId = req.headers["x-request-id"];
    if (existingId) return existingId as string;

    const id = randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },

  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  autoLogging: {
    ignore: (req: IncomingMessage) => {
      const url = req.url ?? "";
      return url.startsWith("/css") || url.startsWith("/js") || url.startsWith("/images") || url === "/favicon.ico";
    },
  },

  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) =>
    `${req.method} ${req.url} -> ${res.statusCode}`,

  customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) =>
    `${req.method} ${req.url} -> ${res.statusCode} (${err.message})`,
});

export default requestLogger;