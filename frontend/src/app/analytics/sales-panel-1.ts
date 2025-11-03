import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

type Item = { name: string; qty: number };

@Component({
  standalone: true,
  selector: 'app-sales1',
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  template: `
    <!-- Top Bar -->
    <div class="topbar">
      <h2>📊 Satış Analitikleri Paneli</h2>

      <div class="date-range">
        <span class="cal-ico">🗓️</span>
        <select [ngModel]="range()" (ngModelChange)="onRangeChange($event)">
          <option *ngFor="let r of ranges" [ngValue]="r.value">{{ r.label }}</option>
        </select>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpis">
      <div class="kpi kpi-red">
        <div class="kpi-title">Toplam indirim</div>
        <div class="kpi-value">₺{{ kpi().discount | number:'1.0-0' }}</div>
        <div class="kpi-sub">
          <span>↘</span>
          <span>{{ kpi().discountChange }}%</span>
        </div>
      </div>

      <div class="kpi kpi-green">
        <div class="kpi-title">Toplam Kar</div>
        <div class="kpi-value">₺{{ kpi().profit | number:'1.0-0' }}</div>
        <div class="kpi-sub">
          <span>↗</span>
          <span>{{ kpi().profitChange }}%</span>
        </div>
      </div>
    </div>

    <!-- Line Chart Card -->
    <div class="card">
      <div class="legend">
        <span *ngFor="let s of series()" class="legend-item">
          <span class="dot" [style.background]="s.color"></span>{{ s.name }}
        </span>
      </div>

      <div class="chart-wrap h300">
        <svg [attr.viewBox]="'0 0 ' + cw + ' ' + ch" preserveAspectRatio="none">
          <!-- axes -->
          <line [attr.x1]="pad.l" [attr.y1]="ch-pad.b" [attr.x2]="cw-pad.r" [attr.y2]="ch-pad.b" class="axis"/>
          <line [attr.x1]="pad.l" [attr.y1]="pad.t" [attr.x2]="pad.l" [attr.y2]="ch-pad.b" class="axis"/>

          <!-- Y grid & ticks -->
          <ng-container *ngFor="let g of yGrid()">
            <line class="grid"
              [attr.x1]="pad.l" [attr.x2]="cw-pad.r"
              [attr.y1]="g.y" [attr.y2]="g.y"></line>
            <text class="tick" [attr.x]="pad.l - 6" [attr.y]="g.y + 4" text-anchor="end">{{ g.value }}</text>
          </ng-container>

          <!-- X ticks -->
          <ng-container *ngFor="let d of xLabels(); index as i">
            <text class="tick"
                  [attr.x]="x(i)"
                  [attr.y]="ch - pad.b + 16"
                  text-anchor="middle">{{ d }}</text>
          </ng-container>

          <!-- lines -->
          <ng-container *ngFor="let s of series()">
            <polyline class="line"
              [attr.points]="points(s.data)"
              [attr.stroke]="s.color" fill="none" stroke-width="2.2"></polyline>
            <!-- markers -->
            <ng-container *ngFor="let p of s.data; index as i">
              <circle class="pt" [attr.cx]="x(i)" [attr.cy]="y(p)" r="2.8" [attr.fill]="s.color"></circle>
            </ng-container>
          </ng-container>
        </svg>
      </div>
    </div>

    <!-- Bar Chart Card -->
    <div class="card">
      <div class="chart-wrap h340">
        <svg [attr.viewBox]="'0 0 ' + bw + ' ' + bh" preserveAspectRatio="none">
          <!-- axis -->
          <line [attr.x1]="bpad.l" [attr.y1]="bh-bpad.b" [attr.x2]="bw-bpad.r" [attr.y2]="bh-bpad.b" class="axis"/>

          <!-- bars -->
          <ng-container *ngFor="let c of cats(); index as i">
            <rect class="bar"
              [attr.x]="barX(i)"
              [attr.y]="barY(c.value)"
              [attr.width]="barW() - gap"
              [attr.height]="(bh - bpad.b) - barY(c.value)"></rect>

            <!-- red top values -->
            <text class="val"
                  [attr.x]="barX(i) + (barW() - gap)/2"
                  [attr.y]="barY(c.value) - 6"
                  text-anchor="middle"> {{ c.value | number:'1.0-1' }}K </text>

            <!-- slanted labels -->
            <g [attr.transform]="'translate(' + (barX(i)+ (barW() - gap)/2) + ',' + (bh - bpad.b + 32) + ') rotate(-25)'">
              <text class="xlab" text-anchor="end">{{ c.name }}</text>
            </g>
          </ng-container>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block; padding:12px; background:#f3f4f6; color:#0b1220; font-family:Inter,system-ui,Arial}
    .topbar{display:flex;align-items:center;gap:12px;margin-bottom:12px}
    .date-range{margin-left:auto;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:6px 10px}
    .date-range select{border:0;outline:none;background:transparent}
    .cal-ico{opacity:.8}

    .kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
    .kpi{border-radius:14px;padding:14px 18px;color:#0b1220}
    .kpi-title{font-size:18px;font-weight:800;opacity:.85}
    .kpi-value{font-size:36px;font-weight:900;margin:6px 0}
    .kpi-sub{font-weight:700;opacity:.8}
    .kpi-red{background:#fee2e2;border:1px solid #fecaca}
    .kpi-green{background:#dcfce7;border:1px solid #bbf7d0}

    .card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px;margin-bottom:12px}
    .legend{display:flex;flex-wrap:wrap;gap:14px;margin:2px 6px 8px}
    .legend-item{font-size:12px;font-weight:600;opacity:.85;display:flex;align-items:center;gap:6px}
    .legend .dot{display:inline-block;width:10px;height:10px;border-radius:50%}

    .chart-wrap{width:100%}
    .h300{height:300px}
    .h340{height:340px}
    svg{width:100%;height:100%}
    .axis{stroke:#e5e7eb}
    .grid{stroke:#f1f5f9}
    .tick{fill:#6b7280;font-size:11px}
    .line{stroke-linejoin:round; stroke-linecap:round}
    .pt{stroke:#fff;stroke-width:1.2}

    /* Bars */
    .bar{fill:#34d399}
    .val{fill:#ef4444;font-weight:800;font-size:11px}
    .xlab{fill:#374151;font-size:11px}

    @media (max-width: 900px){
      .kpis{grid-template-columns:1fr}
    }
  `]
})
export class SalesPanel1Component {
  private api = inject(ApiService);

  ranges = [
    { label: 'Oct 15, 2025 - Oct 21, 2025', value: '2025-10-15:2025-10-21' },
    { label: 'Last 7 days', value: 'last7' },
    { label: 'Last 14 days', value: 'last14' },
  ];
  range = signal<string>(this.ranges[0].value);
  onRangeChange(v: string){ this.range.set(v); this.reload(); }

  kpi = signal({ discount: 86882, discountChange: -1.9, profit: 273443, profitChange: 15.3 });

  cw = 1100; ch = 300;
  pad = { l: 40, r: 20, t: 18, b: 30 };

  series = signal<{name:string;color:string;data:number[]}[]>([
    { name:'YemekSepeti Delivery Hero', color:'#3b82f6', data:[40000,28000,36500,39800,37500,37400,29200] },
    { name:'Trendyol',                  color:'#f59e0b', data:[45000,27500,50200,33000,31000,27800,29600] },
    { name:'Getir Yemek',               color:'#a855f7', data:[30000,27000,28400,35900,34500,31200,21000] },
    { name:'Migros Yemek',              color:'#22c55e', data:[ 8000,20000,22000,21300,18000,15000,17500] },
    { name:'null',                      color:'#06b6d4', data:[ 3000, 4500, 3400, 4100, 6900, 5300, 7200] },
  ]);

  xLabels = () => ['Oct 15','Oct 16','Oct 17','Oct 18','Oct 19','Oct 20','Oct 21'];

  yMax = computed(()=> {
    const all = this.series().flatMap(s => s.data);
    const m = Math.max(...all, 1);
    const step = 10000;
    return Math.ceil(m / step) * step;
  });

  yGrid = computed(()=> {
    const max = this.yMax();
    const steps = 5;
    const arr: { value: string; y: number }[] = [];
    for(let i=0;i<=steps;i++){
      const val = Math.round((max/steps) * i);
      arr.push({ value: (val/1000).toFixed(0) + 'K', y: this.y(val) });
    }
    return arr;
  });

  x = (i:number) => {
    const w = this.cw - this.pad.l - this.pad.r;
    const n = this.xLabels().length - 1;
    const step = n>0 ? w / n : 0;
    return this.pad.l + i * step;
  };

  y = (val:number) => {
    const max = this.yMax();
    const h = this.ch - this.pad.t - this.pad.b;
    const ratio = Math.min(1, val / max);
    return this.ch - this.pad.b - ratio * h;
  };

  points(data:number[]){ return data.map((v,i)=> `${this.x(i)},${this.y(v)}`).join(' '); }

  // ------- Bar chart -------
  bw = 1100; bh = 340;
  bpad = { l: 40, r: 20, t: 16, b: 46 };
  gap = 4;

  cats = signal<{name:string; value:number}[]>([
    {name:'Kredi Kartı', value:192.9}, {name:'Y.S Online', value:133.8}, {name:'Trendyol O..', value:116.5},
    {name:'Geir Online', value:87.3}, {name:'Nakit', value:41.1}, {name:'Migros Onl..', value:30.5},
    {name:'Münferit', value:28.6}, {name:'Edremod', value:24.9}, {name:'P[base (ge..', value:23.2},
    {name:'SetCard', value:20.9}, {name:'Metropol', value:19.4}, {name:'Multinet O..', value:18.7},
    {name:'Smart Ticket', value:12.3}, {name:'Plusee (so..', value:11.8}, {name:'Plusee', value:6.3},
    {name:'Kredi kartı...', value:6.1}, {name:'Setcard O...', value:4.1}, {name:'...', value:3.7}, {name:'...', value:3.3},
  ]);

  barW = computed(()=> {
    const n = this.cats().length;
    const w = this.bw - this.bpad.l - this.bpad.r;
    return n>0 ? w / n : w;
  });

  barX(i:number){ return this.bpad.l + i * this.barW(); }
  barY(v:number){
    const max = Math.max(...this.cats().map(c=>c.value), 1);
    const h = this.bh - this.bpad.t - this.bpad.b;
    return this.bh - this.bpad.b - (v / max) * h;
  }

  // optional: table demo
  items = signal<Item[]>([]);
  topN = signal<number>(10);
  width = 1000; height = 260;
  gapH = 4;
  padTbl = { l: 14, r: 12, t: 10, b: 26 };
  get barHTable(){ return (this.height - this.padTbl.t - this.padTbl.b) / Math.max(1, this.top().length); }

  constructor(){ this.reload(); }

  reload(){
    try{
      this.api.topProducts().subscribe(({items})=>{
        this.items.set(items);
      });
    }catch{}
  }

  top = computed(()=> this.items().slice(0, Math.max(1, Math.min(20, this.topN() || 10))));
}
