export interface GenerateShortURLProps {
  originalURL: string;
  userId: string;
  customAlias?: string;
  expiration: "never" | "1d" | "7d" | "30d" | "90d" | "custom";
  customExpiry?: Date;
};

export interface CreateShortURLData {
  shortId: string;
  redirectURL: string;
  createdBy: string;
  expiresAt?: Date;
}

export interface ExpiryDisplay {
  text: string;
  title: string;
};

export interface DashboardURL {
  _id: string;
  shortId: string;
  redirectURL: string;
  createdAt: Date;
  expiresAt: Date | null;
  totalClicks: number;
  expiryDisplay: ExpiryDisplay;
  isDisabled: boolean;
  status: "active" | "disabled" | "expired";
}

export interface DashboardQueryParams {
  search?: string;
}
