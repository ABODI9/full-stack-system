// src/app/pages/shared/health-test/health-test.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-health-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="ping()">Ping /dashboard/summary</button>
    <pre *ngIf="data">{{ data | json }}</pre>
  `
})
export class HealthTestComponent {
  data: any;
  constructor(private api: ApiService) {}
  ping() {
    this.api.summary().subscribe(d => this.data = d);
  }
}
