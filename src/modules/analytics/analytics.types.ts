export type AnalyticsSourceType = "url" | "qr";

export interface TimeSeriesPoint {
  bucket: string;
  count: number;
}

export interface TopItemPoint {
  id: string;
  count: number;
}

export interface BreakdownPoint {
  label: string;
  count: number;
}

export interface ScopedStats {
  totalCount: number;
  firstActivity: Date | null;
  lastActivity: Date | null;
}

export interface AnalyticsQueryParams {
  type: AnalyticsSourceType;
  id?: string;        
  userId?: string;     
  from?: string;
  to?: string;
  granularity?: "hour" | "day";
}

export interface AnalyticsOverview {
  stats: ScopedStats;
  timeSeries: TimeSeriesPoint[];
  geo: {
    country: BreakdownPoint[];
    region: BreakdownPoint[];
    city: BreakdownPoint[];
  };
  device: {
    browsers: BreakdownPoint[];
    os: BreakdownPoint[];
    devices: BreakdownPoint[];
  };
  referrers: BreakdownPoint[];
  topItems: TopItemPoint[];
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface Requester {
  id: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
}