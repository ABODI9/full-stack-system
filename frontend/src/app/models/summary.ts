export interface Summary {
  sum: number;
  avg: number;
  byCategory: { category: string; value: number }[];
  series: { label: string; value: number }[];
}
