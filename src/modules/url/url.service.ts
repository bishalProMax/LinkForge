import { nanoid } from "nanoid";
import { toggleDisableQR as toggleQRDisabledByMongoId, deleteQRByLinkedUrl } from "../qr/qr.service.js";
import { checkShortIdExists, createShortURL, findURLByShortId, getURLsByUserId, updateURLDisabledStatus, countURLsNewerThan, updateURLBasicInfo, softDeleteURLById, findURLByShortIdAdmin } from "./url.repository.js";
import visitEnrichmentQueue from "../../infrastructure/queues/visitEnrichment.queue.js";
import { getExpiryDate } from "../../shared/utils/expiryDate.js";
import { getDefaultTitle, normalizeTitle } from "../../shared/utils/defaultTitle.js";
import logger from "../../infrastructure/configs/logger.config.js";
import type { DashboardQueryParams, GenerateShortURLProps, VisitContext, RedirectResult } from "./url.types.js";

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
const redirectToOriginalURL = async (shortId: string, visitContext: VisitContext): Promise<RedirectResult> => {
  const url = await findURLByShortId(shortId);

  if (!url) {
    return { type: "NOT_FOUND" };
  }

  if (url.isDisabled) {
    return { type: "DISABLED" };
  }

  if (url.expiresAt && url.expiresAt <= new Date()) {
    return { type: "EXPIRED" };
  }

  await visitEnrichmentQueue.add("enrich-visit", {
    linkId: url._id.toString(),
    ip: visitContext.ip,
    userAgent: visitContext.userAgent,
    referrer: visitContext.referrer,
  });

  return { type: "SUCCESS", redirectURL: url.redirectURL };
};

// Get all URLs created by a user with pagination
const getUserURLs = async (userId: string, page: number, limit: number, filters: DashboardQueryParams = {}): Promise<{ data: any[]; total: number }> => {
  const result = await getURLsByUserId(userId, page, limit, filters);
  const data = result[0]?.data ?? [];
  const total = result[0]?.totalCount[0]?.total ?? 0;
  return { data, total };
};

// Delete a short URL and its associated visits, if any qr linked delete that too
const deleteURL = async (shortId: string, userId: string): Promise<boolean> => {
  const url = await findURLByShortId(shortId);
  if (!url) return false;
  if (url.createdBy.toString() !== userId) throw new Error("Unauthorized to delete this URL.");

  if (url.linkedQRId) {
    await deleteQRByLinkedUrl(url.linkedQRId.toString(), userId);
  }

  await softDeleteURLById(url._id.toString(), userId);

  logger.info({ shortId, userId, cascaded: Boolean(url.linkedQRId) }, "Short URL deleted");
  return true;
};

// toggle disable a short URL, if linked QR exist that too
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

// Edit a short URL's basic information (URL, alias, title)
const editLink = async (shortId: string, userId: string, data: { url: string; alias: string; title?: string; expiration: string; customExpiry?: Date }): Promise<string> => {
  const existing = await findURLByShortId(shortId);
  if (!existing) throw new Error("Link not found.");

  if (existing.createdBy.toString() !== userId) throw new Error("Unauthorized to edit this link.");

  if (data.alias !== existing.shortId) {
    if (RESERVED_ALIASES.includes(data.alias)) throw new Error("This alias is reserved.");

    const conflict = await checkShortIdExists(data.alias);
    if (conflict) throw new Error("Alias already exists.");
  }

  const resolvedTitle = normalizeTitle(data.title) ?? getDefaultTitle(data.url);
  const expiresAt = data.expiration !== "keep" ? getExpiryDate(data.expiration as any, data.customExpiry) : undefined;

  await updateURLBasicInfo(existing._id.toString(), {
    shortId: data.alias,
    redirectURL: data.url,
    title: resolvedTitle,
    ...(data.expiration !== "keep" ? { expiresAt } : {}),  
  });

  logger.info({ oldShortId: shortId, newShortId: data.alias, userId }, "Link edited");
  return data.alias;
};

const URLByShortIdAdmin = async (shortId: string) => {
  return findURLByShortIdAdmin(shortId)
}


export { 
  generateShortURL, 
  redirectToOriginalURL, 
  getUserURLs, 
  deleteURL, 
  toggleDisableURL, 
  findURLDocByShortId,
  resolveFocusPage,
  editLink,
  URLByShortIdAdmin
  };
