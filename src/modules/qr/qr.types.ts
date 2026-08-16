export interface QRDesignInput {
  fgColor?: string;
  bgColor?: string;
  dotStyle?: "square" | "rounded" | "dots";
  frameShape?: "sharp" | "round";
}

export interface CreateStandaloneQRProps {
  destinationURL: string;
  userId: string;
  title?: string;
  expiration: "never" | "1d" | "7d" | "30d" | "90d" | "custom";
  customExpiry?: Date;
  design?: QRDesignInput;
}

export interface CreateLinkedQRProps {
  urlId: string;
  userId: string;
  design?: QRDesignInput;
}

export interface DashboardQRQueryParams {
  search?: string;
  status?: "active" | "disabled" | "expired" | "all";
  expiry?: "all" | "set" | "never";
  linked?: "all" | "linked" | "standalone";
  sortBy?: "newest" | "oldest" | "mostScanned" | "leastScanned";
}

export interface ResolvedQRTarget {
  qrMongoId: string;  
  destination: string;
  expiresAt: Date | null;
  isDisabled: boolean;
}

export interface EditQRProps {
  qrId: string;
  userId: string;
  title?: string;
  destinationURL?: string;
  expiration?: "keep" | "never" | "1d" | "7d" | "30d" | "90d" | "custom";
  customExpiry?: Date;
}

//in qr.repositoory file
export interface CreateQRCodeData {
  qrId: string;
  createdBy: string;
  linkedUrlId?: string;
  title?: string;
  destinationURL?: string;
  expiresAt?: Date | null;
  design: {
    fgColor: string;
    bgColor: string;
    dotStyle: "square" | "rounded" | "dots";
    frameShape: "sharp" | "round";
  };
  status: "PENDING" | "READY" | "FAILED";
}