import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Summary } from '../models/summary';
import { RecordItem } from '../models/record';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  // ---------- Global date range ----------
  private readonly _range = signal(this.lastNDays(7)); // default: last 7 days
  readonly range = computed(() => this._range());
  setRange(start: Date, end: Date) { this._range.set({ start: this.at00(start), end: this.at23(end) }); }

  // ---------- Helpers: JWT header ----------
  /** اجلب التوكن من localStorage (حسب ما عندك في تسجيل الدخول) */
  private get token(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  /** خيارات HTTP مع Authorization Bearer (لو فيه توكن) */
  private authOptions(extra?: { params?: HttpParams }) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.token) headers = headers.set('Authorization', `Bearer ${this.token}`);
    return { headers, withCredentials: true, ...(extra ?? {}) };
  }

  // ====================== REAL BACKEND CALLS ======================
  summary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.base}/dashboard/summary`, this.authOptions());
  }

  records(params?: { from?: string; to?: string }): Observable<RecordItem[]> {
    let p = new HttpParams();
    if (params?.from) p = p.set('from', params.from);
    if (params?.to) p = p.set('to', params.to);
    return this.http.get<RecordItem[]>(`${this.base}/dashboard/records`, this.authOptions({ params: p }));
  }

  chat(text: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${this.base}/chat`, { text }, this.authOptions());
  }

  listCosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/costs`, this.authOptions());
  }

  createCost(input: { date: string | Date; items: string; amount: number }): Observable<any> {
    return this.http.post<any>(`${this.base}/costs`, input, this.authOptions());
  }

  // ====================== AI endpoints ======================
  aiAsk(text: string, mode: 'local' | 'live' = 'local') {
    return this.http.post<{ reply: string }>(`${this.base}/ai/ask`, { text, mode }, this.authOptions());
  }

  aiHistory(limit = 50) {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<{ rows: any[] }>(`${this.base}/ai/history`, this.authOptions({ params }));
  }

  // ====================== MOCK ANALYTICS ENDPOINTS ======================
  // Types kept local to avoid extra files.
  typeKpi = {} as { label: string; value: number; delta?: number; color: string };
  typeDonut = {} as { label: string; percent: number };

  dashboard(): Observable<{
    kpis: Array<ApiService['typeKpi']>;
    lineDaily: number[];
    valueDist: Array<ApiService['typeDonut']>;
    countDist: Array<ApiService['typeDonut']>;
  }> {
    const { start, end } = this.range();
    const days = this.daysBetween(start, end);
    const s = this.seedFromRange(start, end);

    const lineDaily = Array.from({ length: days }, (_, i) => this.randDaily(s + i, 20000, 140000));

    const kpis: Array<ApiService['typeKpi']> = [
      { label: 'Toplam satış', value: this.sum(lineDaily), delta: this.randPct(s + 99), color: '#c9cc7b' },
      { label: 'TOPLAM SİPARİŞ', value: 800 + (s % 600),   delta: this.randPct(s + 98), color: '#8be1ea' },
      { label: 'TOPLAM MÜŞTERİ', value: 520 + (s % 500),   delta: this.randPct(s + 97), color: '#89c1ff' },
      { label: 'ORT. SİPARİŞ DEĞERİ', value: 650 + (s % 150), delta: this.randPct(s + 96), color: '#d7a3e6' },
    ];

    const valueDist = this.distPie(
      [31, 25, 22, 16, 6], s + 5,
      ['YemekSepeti Delivery Hero', 'Trendyol', 'Migros Yemek', 'Getir Yemek', 'Other']
    );
    const countDist = this.distPie(
      [32, 24, 23, 16, 5], s + 6,
      ['YemekSepeti Delivery Hero', 'Trendyol', 'Getir Yemek', 'Migros Yemek', 'Other']
    );

    return of({ kpis, lineDaily, valueDist, countDist }).pipe(delay(120));
  }

  platformMatrix(): Observable<{ rows: { channel: string; days: { name: string; value: number }[] }[] }> {
    const { start, end } = this.range(); const s = this.seedFromRange(start, end);
    const days = ['Çarşamba', 'Cuma', 'Cumartesi', 'Pazar', 'Pazartesi', 'Perşembe', 'Salı'];
    const channels = ['YemekSepeti Delivery Hero', 'null', 'Trendyol', 'Getir Yemek', 'Migros Yemek'];
    const rows = channels.map((c, ci) => ({
      channel: c,
      days: days.map((d, di) => ({ name: d, value: this.randDaily(s + ci * 7 + di, 5000, 50000) })),
    }));
    return of({ rows }).pipe(delay(90));
  }

  cohorts(): Observable<{
    tiles: Array<ApiService['typeKpi']>;
    rows: { cohort: string; month0: number; m1: number; m2: number; m3: number; m6: number; m12: number; customers: number }[];
  }> {
    const { start, end } = this.range(); const s = this.seedFromRange(start, end);
    const month = (m: number) => new Date(end.getFullYear(), end.getMonth() - m, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });

    const rows = [0, 1, 2, 3].map(i => ({
      cohort: month(3 - i),
      month0: 1400 + ((s + i) % 1800),
      m1: 200 + ((s + i) % 900),
      m2: 70 + ((s + i) % 450),
      m3: 20 + ((s + i) % 220),
      m6: 0, m12: 0,
      customers: 1400 + ((s + i) % 1800),
    }));

    const tiles: Array<ApiService['typeKpi']> = [
      { label: 'TOPLAM MÜŞTERİ', value: rows.reduce((a, r) => a + r.customers, 0), color: '#89c1ff' },
      { label: 'yaşam boyu değer ORT.', value: 720 + (s % 160), color: '#8be1ea' },
      { label: 'yaşam boyu değer MAX.', value: 3100 + (s % 900), color: '#d7a3e6' },
      { label: 'yaşam boyu değer MIN.', value: 120 + (s % 60), color: '#c9cc7b' },
    ];

    return of({ tiles, rows }).pipe(delay(70));
  }

  customerMap(): Observable<{ points: { lat: number; lng: number; value: number }[] }> {
    const { start, end } = this.range(); const s = this.seedFromRange(start, end);
    const base = { lat: 41.01, lng: 28.97 };
    const points = Array.from({ length: 40 }, (_, i) => ({
      lat: base.lat + (this.rnd01(s + i) - .5) * 0.25,
      lng: base.lng + (this.rnd01(s * 2 + i) - .5) * 0.45,
      value: this.randDaily(s + i, 300, 4000),
    }));
    return of({ points }).pipe(delay(50));
  }

  topProducts(): Observable<{ items: { name: string; qty: number }[] }> {
    const { start, end } = this.range(); const s = this.seedFromRange(start, end);
    const names = [
      'Burgerator (100g)','Truffles (100g)','Anadolu (100g)','Mushroom (100g)',
      'Chicky (100g)','Barbekü (100g)','Thunder (100g)','Köz Patlıcanlı (100g)',
      'Hot Chili (100g)','Sucuklu (100g)'
    ];
    const items = names
      .map((n, i) => ({ name: n, qty: 80 + ((s + i) % 170) }))
      .sort((a, b) => b.qty - a.qty);
    return of({ items }).pipe(delay(80));
  }

  // ---------------------- helpers (mock) ----------------------
  private lastNDays(n: number) { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - (n - 1)); return { start: this.at00(start), end: this.at23(end) }; }
  private at00(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  private at23(d: Date) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
  private daysBetween(a: Date, b: Date) { return Math.max(1, Math.round((this.at00(b).getTime() - this.at00(a).getTime()) / 86400000) + 1); }
  private sum(a: number[]) { return a.reduce((x, y) => x + y, 0); }
  private seedFromRange(s: Date, e: Date) { const ymd = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); return (ymd(s) * 131 + ymd(e) * 977) >>> 0; }
  private rnd01(seed: number) { let t = seed + 0x6D2B79F5; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  private randDaily(seed: number, min = 5000, max = 100000) { return Math.round(min + (max - min) * this.rnd01(seed)); }
  private randPct(seed: number) { return Math.round((this.rnd01(seed) * 20 + 2) * 10) / 10; }
  private distPie(base: number[], seed: number, labels: string[]) {
    const wiggle = base.map((v, i) => v + (this.rnd01(seed + i) - .5) * 4);
    const total = wiggle.reduce((a, b) => a + b, 0);
    return wiggle.map((v, i) => ({ label: labels[i], percent: Math.round(v / total * 1000) / 10 }));
  }



  // --- تحت بقية دوال الـ ApiService ---
// --- تحت بقية دوال الـ ApiService ---
compareDays(d1: string, d2: string) {
  // إذا كنت تستخدم authOptions() كما في كودك الحالي، استخدمه هنا أيضًا:
  const params = new HttpParams().set('d1', d1).set('d2', d2);
  return this.http.get<{
    day1:   { orders: number; revenue: number };
    day2:   { orders: number; revenue: number };
    deltas: { orders: number; revenue: number };
  }>(`${this.base}/analytics/compare`, this.authOptions({ params }));
}



}
