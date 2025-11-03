import { Component, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

type SubPage = { idx: number; label: string; route: string };

@Component({
  standalone: true,
  selector: 'app-analytics-layout',
  imports: [CommonModule, RouterModule, NgFor, NgIf],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
})
export class AnalyticsLayoutComponent {
  readonly collapsed = signal(localStorage.getItem('subnav_collapsed') === '1');

  toggle() {
    const next = !this.collapsed();
    this.collapsed.set(next);
    localStorage.setItem('subnav_collapsed', next ? '1' : '0');
  }

  readonly pages: SubPage[] = [
    { idx: 1, label: 'Home',                   route: 'home' },
    { idx: 2, label: 'Sales Analytics Panel 1',route: 'sales-panel-1' },
    { idx: 3, label: 'Sales Analytics Panel 2',route: 'sales-panel-2' },
    { idx: 4, label: 'Sales Analytics Panel 3',route: 'sales-panel-3' },
    { idx: 5, label: 'Cost Analysis',          route: 'cost-analysis' },
    { idx: 6, label: 'User Analytics',         route: 'user-analytics' },
    { idx: 7, label: 'Customer Map',           route: 'customer-map' },
  ];
}
