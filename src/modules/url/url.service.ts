import { nanoid } from "nanoid";
import { checkShortIdExists, createShortURL, findURLByShortId, getURLsByUserId, countURLsByUserId } from "./url.repository.js";
import type { GenerateShortURLProps } from "./url.types.js";
import { createVisit, countVisits, getVisits } from "./visit.repository.js";

const generateShortURL = async ({ originalURL, userId }: GenerateShortURLProps): Promise<string> => {
  let shortid: string;
  let exists;
  do {
    shortid = nanoid(7);
    exists = await checkShortIdExists(shortid);
  } while (exists);

  await createShortURL({
    shortId: shortid,
    redirectURL: originalURL,
    createdBy: userId,
  });

  return shortid;
};

const redirectToOriginalURL = async (shortId: string): Promise<any> => {
  const url = await findURLByShortId(shortId);

  if (!url) {
    return null;
  }
  await createVisit(url._id.toString());
  return url;
};

const getURLAnalytics = async (shortId: string): Promise<any> => {
  const url = await findURLByShortId(shortId);

  if (!url) {
    return null;
  }
  const totalClicks = await countVisits(url._id.toString());
  const analytics = await getVisits(url._id.toString());

  return {
    totalClicks,
    analytics,
  };
};

const getUserURLs = async (userId: string, page: number, limit: number): Promise<any> => {
  return getURLsByUserId(userId, page, limit);
};

const getTotalUserURLs = async (userId: string): Promise<number> => {
  return countURLsByUserId(userId);
};

export { 
  generateShortURL, 
  redirectToOriginalURL, 
  getURLAnalytics, 
  getUserURLs, 
  getTotalUserURLs
 };
