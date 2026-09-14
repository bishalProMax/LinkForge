const ISO_DATE_ONLY = /^(\d{4})[-/.](\d{2})[-/.](\d{2})$/;
const DAY_FIRST_DATE_ONLY = /^(\d{2})[-/.](\d{2})[-/.](\d{4})$/;

export const parseFlexibleDate = (raw: string): Date | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const hasTimeComponent = /[T\s]\d{1,2}:\d{2}/.test(trimmed);

  //// YYYY-MM-DD
  const isoMatch = trimmed.match(ISO_DATE_ONLY);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 23, 59, 59, 999);
  }
  //// DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY
  const dayFirstMatch = trimmed.match(DAY_FIRST_DATE_ONLY);
  if (dayFirstMatch) {
    const [, d, m, y] = dayFirstMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), 23, 59, 59, 999);
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return undefined;

  if (!hasTimeComponent) {
    parsed.setHours(23, 59, 59, 999);
  }

  return parsed;
};