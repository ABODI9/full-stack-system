import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

import { ShellComponent } from './shell/shell';

// ===== Analytics (EN names) =====
import { AnalyticsLayoutComponent } from './analytics/layout';
import { HomeComponent }             from './analytics/home';
import { SalesPanel1Component }      from './analytics/sales-panel-1';
import { SalesPanel2Component }      from './analytics/sales-panel-2';
import { SalesPanel3Component }      from './analytics/sales-panel-3';
import { CostAnalysisComponent }     from './analytics/cost-analysis';
import { UserAnalyticsComponent }    from './analytics/user-analytics';
import { CustomerMapComponent }      from './analytics/customer-map';

// Other pages
import { CostsComponent } from './costs/costs';
import { AiInsightsComponent } from './pages/ai-insights/ai-insights';
import { DataEntryComponent } from './pages/data-entry/data-entry';
import { SettingsComponent } from './pages/settings/settings';

import { authGuard } from './guards/auth-guard';
import { GenieInsightsComponent } from './pages/genie-insights/genie-insights';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'analytics' },

      {
        path: 'analytics',
        component: AnalyticsLayoutComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'home' },
          { path: 'home',            component: HomeComponent },
          { path: 'sales-panel-1',  component: SalesPanel1Component },
          { path: 'sales-panel-2',  component: SalesPanel2Component },
          { path: 'sales-panel-3',  component: SalesPanel3Component },
          { path: 'cost-analysis',  component: CostAnalysisComponent },
          { path: 'user-analytics', component: UserAnalyticsComponent },
          { path: 'customer-map',   component: CustomerMapComponent },
        ]
      },

      { path: 'ai-insights', component: AiInsightsComponent },
      { path: 'data-entry',  component: DataEntryComponent },
      { path: 'settings',    component: SettingsComponent },

      { path: 'costs', component: CostsComponent },
      { path: 'genie-insights', component: GenieInsightsComponent },
    ] 
  },

  { path: '**', redirectTo: '' },
];
