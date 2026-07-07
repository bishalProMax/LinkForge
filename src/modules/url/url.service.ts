import { nanoid } from "nanoid";
import { checkShortIdExists, createShortURL, findURLByShortId, getURLsByUserId, countURLsByUserId, deleteURLByShortId, updateURLDisabledStatus } from "./url.repository.js";
import type { GenerateShortURLProps } from "./url.types.js";
import { createVisit, countVisits, getVisits, deleteVisitsByLinkId } from "./visit.repository.js";
import { RESERVED_ALIASES } from "../../shared/utils/reservedAliases.js";

// Generate a short URL with optional custom alias and expiration
const generateShortURL = async ({ originalURL, userId, customAlias, expiration, customExpiry }: GenerateShortURLProps): Promise<string> => {
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
  } else {
    let exists;

    do {
      shortid = nanoid(7);
      exists = await checkShortIdExists(shortid);
    } while (exists);
  }

  const expiresAt = getExpiryDate(expiration, customExpiry);

  await createShortURL({
    shortId: shortid,
    redirectURL: originalURL,
    createdBy: userId,
    expiresAt,
  });

  return shortid;
};

// Redirect to the original URL based on the short ID
const redirectToOriginalURL = async (shortId: string): Promise<any> => {
  const url = await findURLByShortId(shortId);

  if (!url) {
    return null;
  }

  if (url.isDisabled) {
    return null;
  }

  if (url.expiresAt && url.expiresAt <= new Date()) {
    return null;
  }
  
  await createVisit(url._id.toString());
  return url;
};

// Get analytics for a short URL
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

// Get all URLs created by a user with pagination
const getUserURLs = async (userId: string, page: number, limit: number): Promise<any[]> => {
  return getURLsByUserId(userId, page, limit);
};

// Get the total number of URLs created by a user
const getTotalUserURLs = async (userId: string): Promise<number> => {
  return countURLsByUserId(userId);
};

// Delete a short URL and its associated visits
const deleteURL = async (shortId: string, userId: string): Promise<boolean> => {
  const url = await findURLByShortId(shortId);

  if (!url) {
    return false;
  }

  if (url.createdBy.toString() !== userId) {
    throw new Error("Unauthorized to delete this URL.");
  }

  const deletedURL = await deleteURLByShortId(shortId);

  if (!deletedURL) {
    return false;
  }

  await deleteVisitsByLinkId(deletedURL._id.toString());

  return true;
};

// Helper function to calculate the expiry date based on the expiration option
const getExpiryDate = (expiration: GenerateShortURLProps["expiration"], customExpiry?: Date): Date | undefined => {
  const now = Date.now();

  switch (expiration) {
    case "never":
      return undefined;

    case "1d":
      return new Date(now + 24 * 60 * 60 * 1000);

    case "7d":
      return new Date(now + 7 * 24 * 60 * 60 * 1000);

    case "30d":
      return new Date(now + 30 * 24 * 60 * 60 * 1000);

    case "90d":
      return new Date(now + 90 * 24 * 60 * 60 * 1000);

    case "custom":
      return customExpiry;
  }
};

// toggle disable a short URL
const toggleDisableURL = async (shortId: string, userId: string): Promise<boolean> => {
  const url = await findURLByShortId(shortId);

  if (!url) {
    return false;
  }

  if (url.createdBy.toString() !== userId) {
    throw new Error("Unauthorized to modify this URL.");
  }

  if (url.expiresAt && url.expiresAt <= new Date()) {
    throw new Error("Cannot change status of an expired link.");
  }

  await updateURLDisabledStatus(shortId, !url.isDisabled);

  return true;
};

export { generateShortURL, redirectToOriginalURL, getURLAnalytics, getUserURLs, getTotalUserURLs, deleteURL, toggleDisableURL };
