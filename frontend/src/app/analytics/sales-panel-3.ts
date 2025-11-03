import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  standalone:true, selector:'app-sales3', imports:[CommonModule],
  template:`
  <h2>🧭 Platform Revenue Distribution</h2>
  <div class="card">
    <table class="tbl">
      <thead>
        <tr><th>Channel</th><th *ngFor="let d of days">{{d}}</th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let r of data">
          <td>{{r.channel}}</td>
          <td *ngFor="let c of r.days">₺{{c.value | number:'1.0-0'}}</td>
        </tr>
      </tbody>
    </table>
  </div>`,
  styles:[`.tbl{width:100%;border-collapse:collapse} th,td{padding:8px;border-bottom:1px solid #eee}`]
})
export class SalesPanel3Component {
  private api = inject(ApiService);
  data: any[] = []; days = ['Wed','Fri','Sat','Sun','Mon','Thu','Tue'];
  constructor(){ this.api.platformMatrix().subscribe(m=> this.data = m.rows); }
}
