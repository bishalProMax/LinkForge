import { nanoid } from "nanoid";
import { checkShortIdExists, createShortURL, findURLByShortId, getURLsByUserId, countURLsByUserId } from "./url.repository.js";
import type { GenerateShortURLProps } from "./url.types.js";
import { createVisit, countVisits, getVisits } from "./visit.repository.js";
import { RESERVED_ALIASES } from "../../shared/utils/reservedAliases.js";

const generateShortURL = async ({ originalURL, userId, customAlias }: GenerateShortURLProps): Promise<string> => {
  let shortid: string;

  if (customAlias) {
    if (RESERVED_ALIASES.includes(customAlias)) {
      throw new Error("This alias is reserved.");
    }

    const exists = await checkShortIdExists(customAlias);
    if (exists) {
      throw new Error("Alias already exists.");
    }

    shortid = customAlias;
  } 
  else {
    let exists;

    do {
      shortid = nanoid(7);
      exists = await checkShortIdExists(shortid);
    } while (exists);
  }

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

export { generateShortURL, redirectToOriginalURL, getURLAnalytics, getUserURLs, getTotalUserURLs };
