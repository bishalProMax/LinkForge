import { nanoid } from "nanoid";
import { checkShortIdExists, createShortURL, updateVisitHistory, findURLByShortId, getURLsByUserId,} from "../repositories/url.repository.js";

const generateShortURL = async (
  originalURL,
  userId
) => {

  let shortid;
  let exists;
  do {
    shortid = nanoid(7);
    exists = await checkShortIdExists( shortid );
  } while (exists);

  await createShortURL({
    shortId: shortid,
    redirectURL: originalURL,
    visitHistory: [],
    createdBy: userId,
  });

  return shortid;
};

const redirectToOriginalURL = async (
  shortId
) => {

  return updateVisitHistory(
    shortId
  );
};

const getURLAnalytics = async (
  shortId
) => {

  return findURLByShortId(
    shortId 
  );
};

const getUserURLs = async (
  userId
) => {

  return getURLsByUserId(
    userId
  );
};

export {
  generateShortURL,
  redirectToOriginalURL,
  getURLAnalytics,
  getUserURLs,
};