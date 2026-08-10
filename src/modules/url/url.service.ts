import { nanoid } from "nanoid";
import { toggleDisableQR as toggleQRDisabledByMongoId, deleteQRByLinkedUrl } from "../qr/qr.service.js";
import { checkShortIdExists, createShortURL, findURLByShortId, getURLsByUserId, deleteURLByShortId, updateURLDisabledStatus, countURLsNewerThan } from "./url.repository.js";
import { createVisit, countVisits, getVisits, deleteVisitsByLinkId } from "./visit.repository.js";
import { getExpiryDate } from "../../shared/utils/expiryDate.js";
import { getDefaultTitle, normalizeTitle } from "../../shared/utils/defaultTitle.js";
import logger from "../../infrastructure/configs/logger.config.js";
import type { DashboardQueryParams, GenerateShortURLProps } from "./url.types.js";

const RESERVED_ALIASES = ["generate","analytics"]
const DASHBOARD_LIMIT = 6;

// Generate a short URL with optional custom alias and expiration
const generateShortURL = async ({ originalURL, userId, customAlias, expiration, customExpiry, title }: GenerateShortURLProps): Promise<string> => {
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
  const resolvedTitle = normalizeTitle(title) ?? getDefaultTitle(originalURL);

  // const title = title
  await createShortURL({
    shortId: shortid,
    redirectURL: originalURL,
    title: resolvedTitle,
    createdBy: userId,
    expiresAt,
  });

  logger.info({ shortId: shortid, title: resolvedTitle, userId, expiresAt }, "Short URL created");
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
const getUserURLs = async (userId: string, page: number, limit: number, filters: DashboardQueryParams = {}): Promise<{ data: any[]; total: number }> => {
  const result = await getURLsByUserId(userId, page, limit, filters);
  const data = result[0]?.data ?? [];
  const total = result[0]?.totalCount[0]?.total ?? 0;
  return { data, total };
};

// Delete a short URL and its associated visits
const deleteURL = async (shortId: string, userId: string): Promise<boolean> => {
  const url = await findURLByShortId(shortId);
  if (!url) return false;
  if (url.createdBy.toString() !== userId) throw new Error("Unauthorized to delete this URL.");

  if (url.linkedQRId) {
    await deleteQRByLinkedUrl(url.linkedQRId.toString(), userId);
  }

  const deletedURL = await deleteURLByShortId(shortId);
  if (!deletedURL) return false;

  await deleteVisitsByLinkId(deletedURL._id.toString());
  logger.info({ shortId, userId, cascaded: Boolean(url.linkedQRId) }, "Short URL deleted");
  return true;
};

// toggle disable a short URL
const toggleDisableURL = async (shortId: string, userId: string): Promise<boolean> => {
  const url = await findURLByShortId(shortId);
  if (!url) return false;
  if (url.createdBy.toString() !== userId) throw new Error("Unauthorized to modify this URL.");
  if (url.expiresAt && url.expiresAt <= new Date()) throw new Error("Cannot change status of an expired link.");

  const next = !url.isDisabled;
  await updateURLDisabledStatus(shortId, next);

  if (url.linkedQRId) {
    await toggleQRDisabledByMongoId(url.linkedQRId.toString(), userId, next);
  }

  logger.info({ shortId, userId, isDisabled: next, cascaded: Boolean(url.linkedQRId) }, "Short URL disabled status toggled");
  return true;
};

const findURLDocByShortId = (shortId: string) => {
  return findURLByShortId(shortId);
}

// Resolves which page a specific link falls on under default (newest-first) sort.
const resolveFocusPage = async (userId: string, shortId: string): Promise<number | null> => {
  const target = await findURLByShortId(shortId);

  if (!target || target.createdBy.toString() !== userId) {
    return null;
  }

  const rank = await countURLsNewerThan(userId, target.createdAt);
  return Math.floor(rank / DASHBOARD_LIMIT) + 1;
};


export { 
  generateShortURL, 
  redirectToOriginalURL, 
  getURLAnalytics, 
  getUserURLs, 
  deleteURL, 
  toggleDisableURL, 
  findURLDocByShortId,
  resolveFocusPage
  };
