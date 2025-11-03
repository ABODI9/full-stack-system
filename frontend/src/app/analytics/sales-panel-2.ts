import { Component, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

type CompareResp = {
  day1: { orders: number; revenue: number };
  day2: { orders: number; revenue: number };
  deltas: { orders: number; revenue: number };
};

@Component({
  standalone: true,
  selector: 'app-sales2',
  imports: [CommonModule, FormsModule, NgIf],
  template: `
    <div class="sales2">
      <h2>📅 Daily Performance Comparison</h2>

      <form class="controls" (ngSubmit)="run()" #f="ngForm">
        <label>
          Day 1
          <input type="date" name="d1" [(ngModel)]="d1" required />
        </label>
        <label>
          Day 2
          <input type="date" name="d2" [(ngModel)]="d2" required />
        </label>

        <button class="btn" type="submit" [disabled]="loading() || !d1 || !d2">
          {{ loading() ? 'Loading…' : 'Compare' }}
        </button>
      </form>

      <div class="card hint" *ngIf="!data()">
        Hooked to <code>/api/analytics/compare</code> (d1, d2)
      </div>

      <div class="grid" *ngIf="data() as r">
        <div class="card">
          <h3>Day 1 ({{ d1 }})</h3>
          <div class="kpis">
            <div class="kpi"><div class="lbl">Orders</div><div class="val">{{ r.day1.orders | number }}</div></div>
            <div class="kpi"><div class="lbl">Revenue</div><div class="val">₺{{ r.day1.revenue | number:'1.0-0' }}</div></div>
          </div>
        </div>

        <div class="card">
          <h3>Day 2 ({{ d2 }})</h3>
          <div class="kpis">
            <div class="kpi"><div class="lbl">Orders</div><div class="val">{{ r.day2.orders | number }}</div></div>
            <div class="kpi"><div class="lbl">Revenue</div><div class="val">₺{{ r.day2.revenue | number:'1.0-0' }}</div></div>
          </div>
        </div>

        <div class="card">
          <h3>Δ Delta</h3>
          <div class="kpis">
            <div class="kpi"><div class="lbl">Orders</div><div class="val">{{ r.deltas.orders | number }}</div></div>
            <div class="kpi"><div class="lbl">Revenue</div><div class="val">₺{{ r.deltas.revenue | number:'1.0-0' }}</div></div>
          </div>
        </div>
      </div>

      <div class="error" *ngIf="err()">{{ err() }}</div>
    </div>
  `,
  styles: [`
    .sales2{padding:18px 24px}
    h2{margin:0 0 12px;font-weight:600}
    .controls{display:flex;gap:10px;align-items:end;margin-bottom:12px;flex-wrap:wrap}
    label{display:flex;flex-direction:column;font-size:13px;color:#374151;gap:6px}
    input[type=date]{padding:8px 10px;border:1px solid #e5e7eb;border-radius:8px}
    .btn{padding:8px 12px;border:1px solid #2563eb;background:#2563eb;color:#fff;border-radius:8px;cursor:pointer}
    .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 1px 2px rgba(16,24,40,.08);padding:16px}
    .hint{color:#374151}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:8px}
    .kpi{background:#f8fafc;border:1px solid #eef2f7;border-radius:10px;padding:10px}
    .lbl{font-size:12px;color:#6b7280}
    .val{font-weight:800;font-size:18px;color:#0b1220}
    .error{margin-top:10px;color:#b91c1c}
    @media(max-width:1024px){.grid{grid-template-columns:1fr}}
  `]
})
export class SalesPanel2Component {
  d1 = new Date().toISOString().slice(0,10);
  d2 = (() => { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })();

  loading = signal(false);
  data    = signal<CompareResp | null>(null);
  err     = signal<string | null>(null);

  constructor(private api: ApiService){}

  run(){
    this.err.set(null);
    this.data.set(null);
    this.loading.set(true);

    this.api.compareDays(this.d1, this.d2).subscribe({
      next: (res)=>{ this.data.set(res); this.loading.set(false); },
      error: (e)=>{ this.err.set(e?.error?.message || 'Failed to load comparison'); this.loading.set(false); }
    });
  }
}
