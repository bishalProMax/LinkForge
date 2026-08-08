const MAX_TITLE_LENGTH = 100;

export const getDefaultTitle = (destinationURL: string): string => {
  try {
    const { hostname } = new URL(destinationURL);
    const cleanHost = hostname.replace(/^www\./i, "");

    return `${cleanHost} — Untitled`;
  } catch {
    return "Untitled Link";
  }
};


export const normalizeTitle = (title?: string): string | undefined => {
  if (!title) return undefined;

  const trimmed = title.trim();
  if (!trimmed) return undefined;

  return trimmed.slice(0, MAX_TITLE_LENGTH);
};