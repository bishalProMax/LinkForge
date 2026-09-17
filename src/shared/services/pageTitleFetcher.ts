const fetchPageTitle = async (url: string): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; LinkForgeBot/1.0)" } });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
};

export { fetchPageTitle };