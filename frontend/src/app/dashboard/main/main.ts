import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Summary } from '../../models';

/**
 * الصفحة الرئيسية:
 * - تجيب summary و records
 * - نعرض KPIs + جدول زمني بسيط (بدون مكتبة تشارت لتبسيط التثبيت)
 */
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.html',
  styleUrls: ['./main.scss']
})
export class Main implements OnInit {
  private api = inject(ApiService);

  sum = 0;
  avg = 0;
  byCategory: { category: string; value: number }[] = [];
  series: { label: string; value: number }[] = [];
  loading = false;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.api.summary().subscribe({
      next: (s: Summary) => {
        this.sum = s.sum; this.avg = s.avg;
        this.byCategory = s.byCategory; this.series = s.series;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
