export type DateRange = { start: Date; end: Date };

export type Kpi = { label: string; value: number; delta?: number; color: string };

export type DashboardDTO = {
  kpis: Kpi[];
  lineDaily: number[];          // orderTotal باليوم
  valueDist: { label: string; percent: number }[];
  countDist: { label: string; percent: number }[];
};

export type SummaryDTO = {
  series: { label: string; value: number }[];   // لستات Top 5 … إلخ
};

export type TopProductsDTO = {
  items: { name: string; qty: number }[];
};

export type PlatformMatrixRow = {
  channel: string;
  days: { name: string; value: number }[]; // Çarşamba..Salı
};
export type PlatformMatrixDTO = { rows: PlatformMatrixRow[] };

export type CohortRow = {
  cohort: string;
  month0: number; m1: number; m2: number; m3: number; m6: number; m12: number; customers: number;
};
export type CohortsDTO = { tiles: Kpi[]; rows: CohortRow[] };

export type MapPoint = { lat: number; lng: number; value: number };
export type CustomerMapDTO = { points: MapPoint[] };
