import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  standalone:true, selector:'app-user-analytics', imports:[CommonModule],
  template:`
  <h2>👤 User Analytics</h2>
  <div class="card" style="padding:12px">
    <div class="tiles" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px">
      <div class="tile" *ngFor="let t of tiles" [style.background]="t.color" style="border-radius:12px;padding:12px">
        <div style="font-weight:700">{{t.label}}</div>
        <div style="font-size:26px;font-weight:800">₺{{t.value | number:'1.0-0'}}</div>
      </div>
    </div>
    <table class="tbl" style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th>cohort</th><th>month_0_retention</th><th>+1 Month</th><th>+2 Months</th>
        <th>+3 Months</th><th>+6 Months</th><th>+12 Months</th><th>Customers</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let r of rows">
          <td>{{r.cohort}}</td><td>{{r.month0}}</td><td>{{r.m1}}</td><td>{{r.m2}}</td>
          <td>{{r.m3}}</td><td>{{r.m6}}</td><td>{{r.m12}}</td><td>{{r.customers}}</td>
        </tr>
      </tbody>
    </table>
  </div>`
})
export class UserAnalyticsComponent {
  private api = inject(ApiService);
  tiles:any[]=[]; rows:any[]=[];
  constructor(){ this.api.cohorts().subscribe(c=>{ this.tiles=c.tiles; this.rows=c.rows; }); }
}
