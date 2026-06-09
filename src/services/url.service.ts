import { nanoid } from "nanoid";
import { checkShortIdExists, createShortURL, updateVisitHistory, findURLByShortId, getURLsByUserId, countURLsByUserId } from "../repositories/url.repository.js";
import type { GenerateShortURLProps } from "../types/url.types.js";

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
    visitHistory: [],
    createdBy: userId,
  });

  return shortid;
};

const redirectToOriginalURL = async (shortId: string): Promise<any> => {
  return updateVisitHistory(shortId);
};

const getURLAnalytics = async (shortId: string): Promise<any> => {
  return findURLByShortId(shortId);
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
