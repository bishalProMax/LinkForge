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

export interface LinkExistingUrlToQRProps {
  qrId: string;
  userId: string;
}

export interface UpdateQRDesignProps {
  qrId: string;
  userId: string;
  design: QRDesignInput;
}

export interface EditQRProps {
  qrId: string;
  userId: string;
  title?: string;
  destinationURL?: string;
}

export interface DashboardQRQueryParams {
  search?: string;
  status?: "active" | "disabled" | "expired" | "all";
  expiry?: "all" | "set" | "never";
  linked?: "all" | "linked" | "standalone";
  sortBy?: "newest" | "oldest" | "mostScanned" | "leastScanned";
}

export interface DashboardQR {
  _id: string;
  qrId: string;
  title: string;
  destinationURL: string;
  linkedUrlId: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  totalScans: number;
  isDisabled: boolean;
  status: "active" | "disabled" | "expired";
  qrStatus: "PENDING" | "READY" | "FAILED";
  imageUrl?: string;
  design: {
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    frameShape: string;
  };
}

export interface ResolvedQRTarget {
  qrMongoId: string;  
  destination: string;
  expiresAt: Date | null;
  isDisabled: boolean;
}

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