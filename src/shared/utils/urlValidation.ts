import { parse } from "tldts";

export const isValidPublicDomain = (url: string): boolean => {
  const { isIcann, domain } = parse(url);

  return isIcann === true && domain !== null;
};