import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

/**
 * إدخال/عرض التكاليف:
 * - form بسيط
 * - جدول لآخر 50 إدخال
 */
@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './costs.html',
  styleUrls: ['./costs.scss']
})
export class CostsComponent implements OnInit {
  private api = inject(ApiService);

  date = new Date().toISOString().slice(0,10);
  items = '';
  amount: any = '';
  list: any[] = [];
  loading = false;
  msg = '';

  ngOnInit(){ this.load(); }

  load() {
    this.loading = true;
    this.api.listCosts().subscribe({
      next: (rows) => { this.list = rows; this.loading = false; },
      error: () => this.loading = false
    });
  }

  add() {
    this.msg = '';
    const amountNum = Number(this.amount);
    if (!this.items || isNaN(amountNum)) {
      this.msg = 'Fill items and amount (number).';
      return;
    }
    this.api.createCost({ date: this.date, items: this.items, amount: amountNum }).subscribe({
      next: () => { this.items=''; this.amount=''; this.load(); this.msg = 'Saved.'; },
      error: (e) => { this.msg = e?.error?.error ?? 'Error'; }
    });
  }
}
