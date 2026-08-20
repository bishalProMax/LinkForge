import { isbot } from "isbot";

const isBotTraffic = (userAgent: string | undefined): boolean => {
  if (!userAgent) {
    return true;
  }

  return isbot(userAgent);
};

export { isBotTraffic };