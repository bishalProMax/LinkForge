export type GenerateShortURLProps = {
  originalURL: string;
  userId: string;
  customAlias?: string;
};

export type CreateShortURLData = {
  shortId: string;
  redirectURL: string;
  createdBy: string;
};
