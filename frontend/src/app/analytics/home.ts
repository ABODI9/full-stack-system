import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, UpperCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

type Kpi = { label: string; value: number; delta?: number; color: string };
type DonutSlice = { label: string; percent: number };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, UpperCasePipe, DecimalPipe, NgFor, NgIf],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private api: ApiService) {}

  readonly today = signal<Date>(new Date());
  readonly start = signal(new Date());
  readonly end   = signal(new Date());

  readonly customStart = signal(this.toInputDate(this.start()));
  readonly customEnd   = signal(this.toInputDate(this.end()));

  readonly pickerOpen = signal(false);
  togglePicker() { this.pickerOpen.update(v => !v); }

  readonly rangeLabel = computed(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${fmt.format(this.start())} - ${fmt.format(this.end())}`;
  });

  readonly kpis = signal<Kpi[]>([]);
  private readonly seriesRaw = signal<number[]>([]);
  readonly legendColors = ['#5b9cf6', '#7c4dff', '#22c55e', '#f59e0b', '#ec4899'];
  readonly valueDist = signal<DonutSlice[]>([]);
  readonly countDist = signal<DonutSlice[]>([]);

  readonly width = 1100;
  readonly height = 260;
  readonly padding = { t: 16, r: 16, b: 28, l: 40 } as const;

  readonly linePath = computed(() => this.buildLinePath(this.seriesRaw()));
  readonly areaPath = computed(() => this.buildAreaPath(this.seriesRaw()));

  ngOnInit() {
    const g = this.api.range();
    this.start.set(new Date(g.start));
    this.end.set(new Date(g.end));
    this.customStart.set(this.toInputDate(this.start()));
    this.customEnd.set(this.toInputDate(this.end()));
    this.load();
  }

  private load() {
    this.api.dashboard().subscribe(d => {
      this.kpis.set(d.kpis);
      this.seriesRaw.set(d.lineDaily);
      this.valueDist.set(d.valueDist);
      this.countDist.set(d.countDist);
    });
  }

  applyCustomRange() {
    const s = this.fromInputDate(this.customStart());
    const e = this.fromInputDate(this.customEnd());
    if (isNaN(+s) || isNaN(+e) || s > e) return;
    this.start.set(s);
    this.end.set(e);
    this.pickerOpen.set(false);
    this.api.setRange(s, e);
    this.load();
  }

  setPreset(kind: 'today'|'yesterday'|'last7'|'last30'|'thisMonth'|'prevMonth') {
    const today = new Date();
    let s = new Date(today);
    let e = new Date(today);

    switch (kind) {
      case 'today': break;
      case 'yesterday': s.setDate(s.getDate() - 1); e.setDate(e.getDate() - 1); break;
      case 'last7': s.setDate(s.getDate() - 6); break;
      case 'last30': s.setDate(s.getDate() - 29); break;
      case 'thisMonth': s = new Date(today.getFullYear(), today.getMonth(), 1);
                        e = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        break;
      case 'prevMonth': s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        e = new Date(today.getFullYear(), today.getMonth(), 0);
                        break;
    }

    this.start.set(s);
    this.end.set(e);
    this.customStart.set(this.toInputDate(s));
    this.customEnd.set(this.toInputDate(e));
    this.pickerOpen.set(false);
    this.api.setRange(s, e);
    this.load();
  }

  fmt(n: number) { return new Intl.NumberFormat('tr-TR').format(n); }

  private toInputDate(d: Date) {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private fromInputDate(v: string) {
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  private buildLinePath(values: number[]) {
    if (!values.length) return '';
    const w = this.width - this.padding.l - this.padding.r;
    const h = this.height - this.padding.t - this.padding.b;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const nx = (i: number) => this.padding.l + (i / Math.max(1, values.length - 1)) * w;
    const ny = (v: number) => this.padding.t + (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);

    let d = '';
    values.forEach((v, i) => {
      const x = nx(i), y = ny(v);
      d += i ? ` L ${x},${y}` : `M ${x},${y}`;
    });
    return d;
  }

  private buildAreaPath(values: number[]) {
    if (!values.length) return '';
    const baseY = this.height - this.padding.b;
    const endX = this.width - this.padding.r;
    const startX = this.padding.l;
    return `${this.buildLinePath(values)} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
  }

  donutArcs(slices: DonutSlice[], R = 105, r = 64) {
    let accDeg = 0;
    const rad = (deg: number) => (deg * Math.PI) / 180;

    const sector = (saDeg: number, eaDeg: number) => {
      const large = eaDeg - saDeg > 180 ? 1 : 0;
      const sa = rad(saDeg), ea = rad(eaDeg);

      const sx = R * Math.cos(sa), sy = R * Math.sin(sa);
      const ex = R * Math.cos(ea), ey = R * Math.sin(ea);
      const sxi = r * Math.cos(ea), syi = r * Math.sin(ea);
      const exi = r * Math.cos(sa), eyi = r * Math.sin(sa);

      const mid = (sa + ea) / 2;
      const rm = (R + r) / 2;
      const tx = rm * Math.cos(mid);
      const ty = rm * Math.sin(mid);

      const d = [
        `M ${sx} ${sy}`,
        `A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`,
        `L ${sxi} ${syi}`,
        `A ${r} ${r} 0 ${large} 0 ${exi} ${eyi}`,
        'Z'
      ].join(' ');

      return { d, tx, ty };
    };

    return slices.map(s => {
      const start = accDeg - 90;
      const size = (s.percent / 100) * 360;
      const end = start + size;
      accDeg += size;

      const { d, tx, ty } = sector(start, end);
      return { d, label: s.label, percent: s.percent, tx, ty };
    });
  }
}
