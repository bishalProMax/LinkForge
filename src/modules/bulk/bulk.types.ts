export interface BulkLinkRowInput {
  url: string;
  customAlias?: string;
  title?: string;
  expiration?: "never" | "1d" | "7d" | "30d" | "90d" | "custom";
}

export interface BulkQRRowInput {
  destinationURL: string;
  title?: string;
  expiration?: "never" | "1d" | "7d" | "30d" | "90d" | "custom";
}
