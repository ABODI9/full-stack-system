import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common'; // ← أضف DecimalPipe

type DonutDatum = { label: string; value: number; color?: string };

@Component({
  selector: 'app-donut',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe], // ← هنا الحل لخطأ "No pipe found with name 'number'"
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display:block; }
    .wrap { display:grid; gap:12px; }
    .title { font-weight:600; font-size:16px; }
    .chart { width:100%; max-width:640px; margin:auto; display:block; }
    .legend { display:grid; gap:6px; margin-top:6px; font-size:14px; }
    .legend-row { display:flex; align-items:center; gap:8px; }
    .dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
    text { font-weight:700; fill:#0f172a; paint-order:stroke; stroke:white; stroke-width:3px; }
  `],
  template: `
    <div class="wrap">
      <div class="title" *ngIf="title">{{ title }}</div>

      <!-- الرسم -->
      <svg class="chart" [attr.viewBox]="'0 0 ' + size + ' ' + size" preserveAspectRatio="xMidYMid meet">
        <g [attr.transform]="'translate(' + cx + ',' + cy + ')'">
          <ng-container *ngFor="let s of sectors">
            <path [attr.d]="s.path" [attr.fill]="s.color"></path>

            <!-- النسبة داخل القطاع (لو >= minPctLabel) -->
            <ng-container *ngIf="s.pct >= minPctLabel">
              <text [attr.x]="s.tx" [attr.y]="s.ty" text-anchor="middle" dominant-baseline="middle" font-size="14">
                {{ s.pct | number:'1.0-1' }}%
              </text>
            </ng-container>
          </ng-container>

          <!-- فتحة الدونَت -->
          <circle [attr.r]="innerR" fill="white"></circle>
        </g>
      </svg>

      <!-- الليجند -->
      <div class="legend">
        <div class="legend-row" *ngFor="let r of legend">
          <span class="dot" [style.background]="r.color"></span>
          <span>{{ r.label }}</span>
          <span style="margin-left:auto; font-weight:700">{{ r.pct | number:'1.0-1' }}%</span>
        </div>
      </div>
    </div>
  `
})
export class DonutChartComponent {
  /** بيانات: label + value (+color اختياري) */
  @Input() data: DonutDatum[] = [];
  /** عنوان اختياري */
  @Input() title = '';
  /** أصغر نسبة نعرضها داخل القطاع (لتفادي التزاحم) */
  @Input() minPctLabel = 3; // %

  // المقاس
  size = 360;
  get cx() { return this.size / 2; }
  get cy() { return this.size / 2; }
  outerR = 150;
  innerR = 85;

  /** لو ما أُعطِيت ألوان، نستخدم هذه */
  palette = ['#5b9cf6','#7c4dff','#22c55e','#f59e0b','#ec4899','#06b6d4'];

  // ناتج محسوب للرسم + الليجند
  get sectors() {
    const total = Math.max(1, this.data.reduce((a, d) => a + (d.value || 0), 0));
    let acc = -Math.PI / 2; // نبدأ للأعلى
    return this.data.map((d, i) => {
      const v = Math.max(0, d.value || 0);
      const frac = v / total;
      const angle = frac * Math.PI * 2;
      const start = acc;
      const end = acc + angle;
      acc = end;

      const color = d.color ?? this.palette[i % this.palette.length];
      const path = this.describeArc(this.cx, this.cy, this.outerR, this.innerR, start, end);

      // موضع النص عند مركز القوس
      const mid = (start + end) / 2;
      const r = (this.outerR + this.innerR) / 2;
      const tx = this.cx + r * Math.cos(mid);
      const ty = this.cy + r * Math.sin(mid);

      const pct = frac * 100;

      return { path, color, pct, tx, ty };
    });
  }

  get legend() {
    const total = Math.max(1, this.data.reduce((a, d) => a + (d.value || 0), 0));
    return this.data.map((d, i) => ({
      label: d.label,
      pct: (Math.max(0, d.value || 0) / total) * 100,
      color: d.color ?? this.palette[i % this.palette.length],
    }));
  }

  /** يكوّن مسار دونَت (قوس خارجي + قوس داخلي معكوس) */
  private describeArc(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
    const large = end - start > Math.PI ? 1 : 0;

    // نقاط القوس الخارجي
    const x1 = cx + rOuter * Math.cos(start);
    const y1 = cy + rOuter * Math.sin(start);
    const x2 = cx + rOuter * Math.cos(end);
    const y2 = cy + rOuter * Math.sin(end);

    // نقاط القوس الداخلي (عكسياً)
    const x3 = cx + rInner * Math.cos(end);
    const y3 = cy + rInner * Math.sin(end);
    const x4 = cx + rInner * Math.cos(start);
    const y4 = cy + rInner * Math.sin(start);

    return [
      `M ${x1} ${y1}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
  }
}
