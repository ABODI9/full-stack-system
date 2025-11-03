import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

type Insight = {
  kind: 'trend' | 'anomaly' | 'top' | 'retention' | 'platform';
  title: string;
  detail: string;
  severity: 'low' | 'med' | 'high';
  tags?: string[];
  ask?: string; // question to send to /ai-insights
};

@Component({
  standalone: true,
  selector: 'app-genie-insights',
  imports: [CommonModule, NgFor, NgIf, DecimalPipe],
  templateUrl: './genie-insights.html',
  styleUrls: ['./genie-insights.scss'],
})
export class GenieInsightsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  loading = signal(true);
  error   = signal<string | null>(null);
  insights = signal<Insight[]>([]);

  // small helpers
  private fmtTL = (n: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

  ngOnInit() {
    this.load();
  }

  openAI(q: string) {
    this.router.navigate(['/ai-insights'], { queryParams: { q } });
  }

  private load() {
    this.loading.set(true);
    this.error.set(null);

    // نستدعي 3 مصادر وهمية من ApiService ونركب منها الرؤى
    const subs: any[] = [];

    // 1) Dashboard (KPIs + series + pies)
    subs.push(this.api.dashboard().subscribe({
      next: d => {
        const kpis = d.kpis ?? [];
        const totalSales = kpis[0]?.value ?? 0;
        const orders     = kpis[1]?.value ?? 0;
        const line       = d.lineDaily ?? [];
        const last = line.at(-1) ?? 0;
        const prev = line.at(-2) ?? last;
        const change = prev ? Math.round(((last - prev) / prev) * 100) : 0;

        const valueDist = d.valueDist ?? [];
        const topPlatform = valueDist[0]?.label ?? 'Unknown';
        const topPlatformPct = valueDist[0]?.percent ?? 0;

        const bucket: Insight[] = [
          {
            kind: 'trend',
            severity: Math.abs(change) >= 15 ? 'high' : Math.abs(change) >= 7 ? 'med' : 'low',
            title: change >= 0 ? 'Sales are trending up' : 'Sales dropped day-over-day',
            detail: `Latest daily sales are ₺${this.fmtTL(last)} (${change >= 0 ? '+' : ''}${change} % vs previous day).`,
            tags: ['Daily trend', 'Revenue'],
            ask: 'show me daily sales trend for the last 14 days',
          },
          {
            kind: 'top',
            severity: 'med',
            title: `Top revenue platform: ${topPlatform}`,
            detail: `${topPlatform} contributed ~${topPlatformPct}% of total revenue in the selected range.`,
            tags: ['Platform', 'Mix'],
            ask: 'break down sales by platform and rank them by revenue share',
          },
          {
            kind: 'anomaly',
            severity: orders > 2000 ? 'high' : 'low',
            title: orders > 2000 ? 'Unusually high orders total' : 'Orders within expected range',
            detail: `Total orders in range: ${this.fmtTL(orders)}.`,
            tags: ['Orders'],
            ask: 'show orders distribution by day and detect spikes',
          },
        ];

        // append (we may get more from other calls)
        this.insights.update(arr => [...arr, ...bucket]);
      },
      error: () => this.error.set('Failed to load dashboard data.')
    }));

    // 2) Top products
    subs.push(this.api.topProducts().subscribe({
      next: d => {
        const list = (d.items ?? []).slice(0, 3);
        if (list.length) {
          const names = list.map(x => x.name).join(', ');
          this.insights.update(arr => [
            ...arr,
            {
              kind: 'top',
              severity: 'med',
              title: 'Top products',
              detail: `Best sellers: ${names}.`,
              tags: ['Products'],
              ask: 'what are my top 10 products by quantity and revenue?',
            }
          ]);
        }
      },
      error: () => this.error.set('Failed to load products.')
    }));

    // 3) Cohorts (retention)
    subs.push(this.api.cohorts().subscribe({
      next: d => {
        const rows = d.rows ?? [];
        if (rows.length) {
          const best = [...rows].sort((a,b)=> (b.m1+b.m2+b.m3) - (a.m1+a.m2+a.m3))[0];
          this.insights.update(arr => [
            ...arr,
            {
              kind: 'retention',
              severity: 'low',
              title: `Best cohort: ${best.cohort}`,
              detail: `Month0=${best.month0}, M1=${best.m1}, M2=${best.m2}, M3=${best.m3}.`,
              tags: ['Retention', 'Cohorts'],
              ask: 'analyze customer retention by monthly cohorts',
            }
          ]);
        }
      },
      error: () => this.error.set('Failed to load cohorts.')
    }));

    // Finish loading after a short tick
    setTimeout(() => this.loading.set(false), 350);
  }
}
