export interface BulkLinkRowInput {
  destinationURL: string;
  customAlias?: string;
  title?: string;
  expiration?: "never" | "1d" | "3d" | "7d" | "30d" | "custom";
  customExpiry?: string;
}

export interface BulkQRRowInput {
  destinationURL: string;
  title?: string;
  expiration?: "never" | "1d" | "3d" | "7d" | "30d" | "custom";
  customExpiry?: string;
}

export interface BulkExportData {
  headers: string[];
  rows: Record<string, unknown>[];
}